import { createAvatar, type AvatarOptions, type Style } from "@avatar-generator/core";

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
export class AvatarElement extends HTMLElement {
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

/**
 * Registers the `<avatar-generator>` custom element. Called automatically
 * when the module is imported. Safe to call multiple times — additional
 * registrations are ignored.
 */
export function register(tagName = "avatar-generator"): void {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, AvatarElement);
    }
}
