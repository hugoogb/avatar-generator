import {
    adaptForImage,
    adaptGroupForImage,
    createAvatar,
    createAvatarGroup,
    subscribeViewerPreferences,
    type AvatarGroupItem,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-generator/core";

/**
 * `HTMLElement` does not exist on a server, and `class X extends HTMLElement`
 * is evaluated the moment this module is imported — so importing the package
 * from a Next.js, Nuxt, Astro or SvelteKit server render used to throw
 * `ReferenceError: HTMLElement is not defined` before any of the consumer's
 * code ran.
 *
 * Extending a stand-in when there is no DOM lets the module evaluate anywhere.
 * The stand-in is never instantiated: custom elements are only ever constructed
 * by the browser, and {@link register} does nothing without a registry.
 */
const HTMLElementBase: typeof HTMLElement =
    typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

/** Styles the `avatar-style` attribute can name, filled by {@link registerStyle}. */
const styleRegistry = new Map<string, Style<AvatarOptions>>();

/** Connected elements, so a style registered late can paint the ones naming it. */
const connected = new Set<{ refresh(): void }>();

/**
 * Makes a style available to the `avatar-style` attribute, under its own
 * `name` unless you give another. Elements already on the page that name it
 * render straight away. The CDN bundle registers all eleven built-in styles.
 *
 * @param style - The style to register
 * @param name - The name the attribute uses (default: `style.name`)
 *
 * @example
 * ```ts
 * import { registerStyle } from "@avatar-generator/web-component";
 * import { faces } from "@avatar-generator/style-faces";
 *
 * registerStyle(faces); // <avatar-generator avatar-style="faces" seed="ana">
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any style's options extend AvatarOptions
export function registerStyle(style: Style<any>, name: string = style.name): void {
    styleRegistry.set(name, style);
    for (const el of connected) el.refresh();
}

/** Parses a JSON attribute, reporting bad JSON instead of breaking every render. */
function parseJsonAttribute<T>(el: HTMLElement, attribute: string): T | undefined {
    const raw = el.getAttribute(attribute);
    if (raw === null) return undefined;
    try {
        return JSON.parse(raw) as T;
    } catch {
        console.error(`<${el.localName}>: the "${attribute}" attribute is not valid JSON:`, raw);
        return undefined;
    }
}

/** The `styleImpl` property, else the style the `avatar-style` attribute names. */
function resolveStyle(el: HTMLElement, property: Style<AvatarOptions> | null): Style<AvatarOptions> | null {
    if (property) return property;
    const name = el.getAttribute("avatar-style");
    return name === null ? null : (styleRegistry.get(name) ?? null);
}

/**
 * Framework-agnostic custom element that renders an avatar.
 *
 * From JavaScript, set two properties: `styleImpl` (the avatar style) and
 * `options` (its config). We deliberately avoid a `style` property name
 * because `HTMLElement.style` already exists.
 *
 * From plain HTML, use attributes: `avatar-style` names a style added with
 * {@link registerStyle}, `seed` and `size` set those options, and `options`
 * takes JSON for the rest. When a property and an attribute set the same
 * thing, the property wins.
 *
 * @example HTML, with the CDN bundle
 * ```html
 * <avatar-generator avatar-style="faces" seed="ana" size="48"></avatar-generator>
 * ```
 *
 * @example JavaScript
 * ```ts
 * import "@avatar-generator/web-component";
 * import { initials } from "@avatar-generator/style-initials";
 *
 * const el = document.createElement("avatar-generator");
 * el.styleImpl = initials;
 * el.options = { seed: "Hugo GB", size: 64 };
 * document.body.append(el);
 * ```
 */
export class AvatarElement extends HTMLElementBase {
    private _styleImpl: Style<AvatarOptions> | null = null;
    private _options: AvatarOptions | null = null;
    private _img: HTMLImageElement;
    private _stopWatching: (() => void) | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        this._img = document.createElement("img");
        this._img.style.display = "block";
        shadow.appendChild(this._img);
    }

    get styleImpl(): Style<AvatarOptions> | null {
        return this._styleImpl;
    }

    set styleImpl(value: Style<AvatarOptions> | null) {
        this._styleImpl = value;
        this._render();
    }

    get options(): AvatarOptions | null {
        return this._options;
    }

    set options(value: AvatarOptions | null) {
        this._options = value;
        this._render();
    }

    get alt(): string {
        return this.getAttribute("alt") ?? "Avatar";
    }

    static get observedAttributes(): string[] {
        return ["alt", "avatar-style", "seed", "size", "options"];
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
        if (name === "alt") {
            this._img.alt = value ?? "Avatar";
        } else {
            this._render();
        }
    }

    connectedCallback(): void {
        this._img.alt = this.alt;
        this._stopWatching = subscribeViewerPreferences(() => this._render());
        connected.add(this);
        this._render();
    }

    disconnectedCallback(): void {
        this._stopWatching?.();
        this._stopWatching = null;
        connected.delete(this);
    }

    /** Renders again, e.g. after a style this element names was registered. */
    refresh(): void {
        this._render();
    }

    /** Attribute options first, then the `options` property on top. */
    private _resolveOptions(): AvatarOptions | null {
        const seed = this.getAttribute("seed");
        const size = this.getAttribute("size");
        const merged: Partial<AvatarOptions> = {
            ...parseJsonAttribute<Partial<AvatarOptions>>(this, "options"),
            ...(seed !== null && { seed }),
            ...(size !== null && { size: Number(size) }),
            ...this._options,
        };
        return typeof merged.seed === "string" ? (merged as AvatarOptions) : null;
    }

    private _render(): void {
        const style = resolveStyle(this, this._styleImpl);
        const options = style && this._resolveOptions();
        if (!style || !options) return;
        const result = createAvatar(style, adaptForImage(options));
        this._img.src = result.toDataUri();
        const size = options.size ?? 64;
        this._img.width = size;
        this._img.height = size;
    }
}

/**
 * Custom element for a row of overlapping avatars.
 *
 * Like {@link AvatarElement}, it takes JavaScript properties (`styleImpl`,
 * `items` and `options`) or, from plain HTML, attributes: `avatar-style`,
 * `items` as a JSON array and `options` as JSON. A property wins over the
 * matching attribute.
 *
 * @example HTML, with the CDN bundle
 * ```html
 * <avatar-generator-group avatar-style="faces" items='["ana","ben","chi"]' options='{"size":40}'>
 * </avatar-generator-group>
 * ```
 *
 * @example JavaScript
 * ```ts
 * const el = document.createElement("avatar-generator-group");
 * el.styleImpl = faces;
 * el.items = ["ana", "ben", "chi", "dee"];
 * el.options = { size: 40, max: 3 };
 * el.setAttribute("alt", "Project team");
 * document.body.append(el);
 * ```
 */
export class AvatarGroupElement extends HTMLElementBase {
    private _styleImpl: Style<AvatarOptions> | null = null;
    private _items: AvatarGroupItem[] | null = null;
    private _options: AvatarGroupOptions | undefined = undefined;
    private _label = "";
    private _img: HTMLImageElement;
    private _stopWatching: (() => void) | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        this._img = document.createElement("img");
        this._img.style.display = "block";
        shadow.appendChild(this._img);
    }

    get styleImpl(): Style<AvatarOptions> | null {
        return this._styleImpl;
    }

    set styleImpl(value: Style<AvatarOptions> | null) {
        this._styleImpl = value;
        this._render();
    }

    get items(): AvatarGroupItem[] | null {
        return this._items;
    }

    set items(value: AvatarGroupItem[] | null) {
        this._items = value;
        this._render();
    }

    get options(): AvatarGroupOptions | undefined {
        return this._options;
    }

    set options(value: AvatarGroupOptions | undefined) {
        this._options = value;
        this._render();
    }

    static get observedAttributes(): string[] {
        return ["alt", "avatar-style", "items", "options"];
    }

    attributeChangedCallback(name: string): void {
        if (name === "alt") {
            this._applyAlt();
        } else {
            this._render();
        }
    }

    connectedCallback(): void {
        this._stopWatching = subscribeViewerPreferences(() => this._render());
        connected.add(this);
        this._render();
    }

    disconnectedCallback(): void {
        this._stopWatching?.();
        this._stopWatching = null;
        connected.delete(this);
    }

    /** Renders again, e.g. after a style this element names was registered. */
    refresh(): void {
        this._render();
    }

    private _applyAlt(): void {
        this._img.alt = this.getAttribute("alt") ?? this._label;
    }

    private _render(): void {
        const style = resolveStyle(this, this._styleImpl);
        const items = this._items ?? parseJsonAttribute<AvatarGroupItem[]>(this, "items");
        if (!style || !items) return;
        const options = { ...parseJsonAttribute<AvatarGroupOptions>(this, "options"), ...this._options };
        const group = createAvatarGroup(style, ...adaptGroupForImage(items, options));
        this._label = group.label;
        this._img.src = group.toDataUri();
        this._img.width = group.width;
        this._img.height = group.height;
        this._applyAlt();
    }
}

/**
 * Registers the group element, `<avatar-generator-group>` by default. Called
 * automatically when the module is imported, and safe to call again.
 *
 * @param tagName - The tag name to register the element under
 */
export function registerGroup(tagName = "avatar-generator-group"): void {
    if (typeof customElements === "undefined") return;
    if (customElements.get(tagName)) return;
    customElements.define(tagName, class extends AvatarGroupElement {});
}

/** Whether `AvatarElement` itself has been handed to the registry yet. */
let baseConstructorUsed = false;

/**
 * Registers the custom element, `<avatar-generator>` by default. Called
 * automatically when the module is imported. Safe to call multiple times —
 * registering a tag name that already exists is ignored.
 *
 * @param tagName - The tag name to register the element under
 *
 * @example Register under a second name as well
 * ```ts
 * import { register } from '@avatar-generator/web-component';
 *
 * register('user-avatar'); // <user-avatar> alongside <avatar-generator>
 * ```
 */
export function register(tagName = "avatar-generator"): void {
    // No registry means no DOM: this is a server render, and there is nothing
    // to define. Importing the package must stay a no-op there.
    if (typeof customElements === "undefined") return;

    if (customElements.get(tagName)) return;

    // A constructor may back exactly one tag name; the registry throws on a
    // second use. Importing this module already binds AvatarElement to
    // <avatar-generator>, so every additional name gets its own subclass —
    // otherwise `register('my-avatar')` could never work for anyone.
    customElements.define(tagName, baseConstructorUsed ? class extends AvatarElement {} : AvatarElement);
    baseConstructorUsed = true;
}
