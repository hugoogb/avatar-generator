// @vitest-environment happy-dom
import { createAvatar, createAvatarGroup, type AvatarOptions, type Style } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AvatarElement, register, registerGroup, type AvatarGroupElement } from "@avatar-generator/web-component";

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

describe("<avatar-generator-group>", () => {
    const seeds = ["ana", "ben", "chi"];

    const mountGroup = () => {
        const el = document.createElement("avatar-generator-group") as AvatarGroupElement;
        el.styleImpl = initials as Style<AvatarOptions>;
        el.items = seeds;
        el.options = { size: 40 };
        document.body.append(el);
        return { el, image: el.shadowRoot?.querySelector("img") as HTMLImageElement };
    };

    it("is registered on import", () => {
        expect(customElements.get("avatar-generator-group")).toBeDefined();
    });

    it("renders the group the core API produces", () => {
        const group = createAvatarGroup(initials as Style<AvatarOptions>, seeds, { size: 40 });
        const { image } = mountGroup();

        expect(image.src).toBe(group.toDataUri());
        expect(image.width).toBe(group.width);
    });

    it("defaults alt to the group's label and follows the attribute", () => {
        const { el, image } = mountGroup();
        expect(image.alt).toBe("3 avatars");
        el.setAttribute("alt", "Team");
        expect(image.alt).toBe("Team");
        el.removeAttribute("alt");
        expect(image.alt).toBe("3 avatars");
    });

    it("can be registered under another name", () => {
        registerGroup("team-avatars");
        expect(customElements.get("team-avatars")).toBeDefined();
        expect(() => registerGroup("team-avatars")).not.toThrow();
    });
});

/** Reports every media query containing `feature` as matching. */
const stubMatchMedia = (feature: string) => {
    const listeners = new Set<() => void>();
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes(feature),
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }));
    return listeners;
};

describe("viewer preferences (web component)", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("does not animate for a viewer who prefers reduced motion", () => {
        stubMatchMedia("reduced-motion");
        const el = mount();
        el.styleImpl = initials as Style<AvatarOptions>;
        el.options = { seed: "x", animation: true };
        expect(imgIn(el)?.src).toBe(createAvatar(initials, { seed: "x" }).toDataUri());
    });

    it("re-renders when the setting changes, and stops when removed", () => {
        const listeners = stubMatchMedia("nothing");
        const el = mount();
        el.styleImpl = initials as Style<AvatarOptions>;
        el.options = { seed: "x", animation: true };
        expect(imgIn(el)?.src).toBe(createAvatar(initials, { seed: "x", animation: true }).toDataUri());

        const previous = [...listeners];
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: query.includes("reduced-motion"),
            addEventListener: () => {},
            removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
        }));
        previous.forEach((listener) => listener());
        expect(imgIn(el)?.src).toBe(createAvatar(initials, { seed: "x" }).toDataUri());

        el.remove();
        expect(listeners.size).toBe(0);
    });

    it("applies to groups", () => {
        stubMatchMedia("reduced-motion");
        const el = document.createElement("avatar-generator-group") as AvatarGroupElement;
        el.styleImpl = initials as Style<AvatarOptions>;
        el.items = ["a"];
        el.options = { options: { animation: true } };
        document.body.append(el);
        const image = el.shadowRoot?.querySelector("img") as HTMLImageElement;
        expect(image.src).toBe(createAvatarGroup(initials as Style<AvatarOptions>, ["a"]).toDataUri());
    });
});
