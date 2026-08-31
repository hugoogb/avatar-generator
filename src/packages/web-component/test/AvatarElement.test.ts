// @vitest-environment happy-dom
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { afterEach, describe, expect, it } from "vitest";
import { AvatarElement, register } from "@avatar-generator/web-component";

/** The element paints into a shadow root, so reach through it to assert. */
const imgIn = (el: AvatarElement) => el.shadowRoot?.querySelector("img") ?? null;

const mount = (): AvatarElement => {
    const el = document.createElement("avatar-generator") as AvatarElement;
    document.body.appendChild(el);
    return el;
};

afterEach(() => {
    document.body.innerHTML = "";
});

describe("<avatar-generator>", () => {
    it("auto-registers the element when the package is imported", () => {
        expect(customElements.get("avatar-generator")).toBe(AvatarElement);
    });

    it("renders nothing until both a style and options are set", () => {
        const el = mount();

        expect(imgIn(el)?.getAttribute("src") ?? null).toBeNull();
    });

    it("renders once both properties are set", () => {
        const el = mount();
        el.styleImpl = initials;
        el.options = { seed: "Hugo GB" };

        expect(imgIn(el)?.getAttribute("src")).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("does not depend on the order the two properties are set", () => {
        const el = mount();
        el.options = { seed: "Hugo GB" };
        el.styleImpl = initials;

        expect(imgIn(el)?.getAttribute("src")).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("re-renders when the seed changes", () => {
        const el = mount();
        el.styleImpl = initials;
        el.options = { seed: "first" };
        const before = imgIn(el)?.getAttribute("src");

        el.options = { seed: "second" };

        expect(imgIn(el)?.getAttribute("src")).not.toBe(before);
        expect(imgIn(el)?.getAttribute("src")).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("re-renders when the style changes", () => {
        const el = mount();
        el.styleImpl = initials;
        el.options = { seed: "same-seed" };
        const before = imgIn(el)?.getAttribute("src");

        el.styleImpl = geometric;

        expect(imgIn(el)?.getAttribute("src")).not.toBe(before);
    });

    it("sizes the image from options.size", () => {
        const el = mount();
        el.styleImpl = initials;
        el.options = { seed: "Hugo GB", size: 96 };

        expect(imgIn(el)?.getAttribute("width")).toBe("96");
        expect(imgIn(el)?.getAttribute("height")).toBe("96");
    });

    it("reads alt from the attribute", () => {
        const el = mount();
        el.setAttribute("alt", "Hugo García");
        el.styleImpl = initials;
        el.options = { seed: "Hugo GB" };

        expect(imgIn(el)?.getAttribute("alt")).toBe("Hugo García");
    });

    // `style` is taken by HTMLElement.style, which is why the property is
    // `styleImpl`. Setting `style` must never be mistaken for the avatar style.
    it("keeps HTMLElement.style working as CSS", () => {
        const el = mount();
        el.style.display = "block";

        expect(el.style.display).toBe("block");
        expect(el.styleImpl).toBeNull();
    });

    it("register() is idempotent", () => {
        expect(() => register()).not.toThrow();
        expect(customElements.get("avatar-generator")).toBe(AvatarElement);
    });

    // The registry allows one tag name per constructor, and importing the
    // package already spends that on <avatar-generator>. A second name only
    // works if it gets its own subclass.
    it("register() accepts a custom tag name alongside the default", () => {
        expect(() => register("my-avatar")).not.toThrow();

        const ctor = customElements.get("my-avatar");
        expect(ctor).toBeDefined();
        expect(ctor).not.toBe(AvatarElement);
        expect(Object.create(ctor!.prototype)).toBeInstanceOf(AvatarElement);
    });

    it("renders through a custom tag name", () => {
        register("rendered-avatar");
        const el = document.createElement("rendered-avatar") as AvatarElement;
        document.body.appendChild(el);

        el.styleImpl = initials;
        el.options = { seed: "Hugo GB" };

        expect(imgIn(el)?.getAttribute("src")).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });
});
