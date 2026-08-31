import { createAvatar, type AvatarOptions, type Style } from "@avatar-generator/core";

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

/**
 * Framework-agnostic custom element that renders an avatar.
 *
 * The element exposes two JavaScript properties — `styleImpl` (the avatar
 * style) and `options` (its config). We deliberately avoid a `style`
 * property name because `HTMLElement.style` already exists. Properties are
 * used rather than attributes because `Style` is a JS object, not a
 * stringifiable value.
 *
 * @example
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
        return ["alt"];
    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
        if (name === "alt") {
            this._img.alt = value ?? "Avatar";
        }
    }

    connectedCallback(): void {
        this._img.alt = this.alt;
        this._render();
    }

    private _render(): void {
        if (!this._styleImpl || !this._options) return;
        const result = createAvatar(this._styleImpl, this._options);
        this._img.src = result.toDataUri();
        const size = this._options.size ?? 64;
        this._img.width = size;
        this._img.height = size;
    }
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
