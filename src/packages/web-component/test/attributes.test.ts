// @vitest-environment happy-dom
import { createAvatar, createAvatarGroup, type AvatarOptions, type Style } from "@avatar-generator/core";
import { geometric } from "@avatar-generator/style-geometric";
import { initials } from "@avatar-generator/style-initials";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerStyle, type AvatarElement } from "@avatar-generator/web-component";

const srcOf = (el: Element) => el.shadowRoot?.querySelector("img")?.getAttribute("src") ?? null;

/** Parses HTML into the page, the way a no-build user writes it. */
const html = <T extends Element>(markup: string): T => {
    document.body.innerHTML = markup;
    return document.body.firstElementChild as T;
};

afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

registerStyle(initials);

describe("<avatar-generator> attributes", () => {
    it("renders from plain HTML with a registered style", () => {
        const el = html(`<avatar-generator avatar-style="initials" seed="Hugo GB" size="48"></avatar-generator>`);

        expect(srcOf(el)).toBe(createAvatar(initials, { seed: "Hugo GB", size: 48 }).toDataUri());
        expect(el.shadowRoot?.querySelector("img")?.width).toBe(48);
    });

    it("takes the remaining options as JSON", () => {
        const el = html(
            `<avatar-generator avatar-style="initials" seed="x" options='{"square":true}'></avatar-generator>`,
        );

        expect(srcOf(el)).toBe(createAvatar(initials, { seed: "x", square: true }).toDataUri());
    });

    it("re-renders when an attribute changes", () => {
        const el = html(`<avatar-generator avatar-style="initials" seed="first"></avatar-generator>`);
        el.setAttribute("seed", "second");

        expect(srcOf(el)).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("renders nothing for a style name nobody registered", () => {
        const el = html(`<avatar-generator avatar-style="nope" seed="x"></avatar-generator>`);

        expect(srcOf(el)).toBeNull();
    });

    it("renders as soon as the named style is registered later", () => {
        const el = html(`<avatar-generator avatar-style="late" seed="x"></avatar-generator>`);
        expect(srcOf(el)).toBeNull();

        registerStyle(geometric, "late");

        expect(srcOf(el)).toBe(createAvatar(geometric, { seed: "x" }).toDataUri());
    });

    it("lets the properties win over the matching attributes", () => {
        const el = html<AvatarElement>(`<avatar-generator avatar-style="initials" seed="attr"></avatar-generator>`);
        el.styleImpl = geometric as Style<AvatarOptions>;
        el.options = { seed: "prop" };

        expect(srcOf(el)).toBe(createAvatar(geometric, { seed: "prop" }).toDataUri());
    });

    it("reports bad JSON and renders without it", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const el = html(`<avatar-generator avatar-style="initials" seed="x" options="{oops"></avatar-generator>`);

        expect(error).toHaveBeenCalled();
        expect(srcOf(el)).toBe(createAvatar(initials, { seed: "x" }).toDataUri());
    });
});

describe("<avatar-generator-group> attributes", () => {
    it("renders from plain HTML", () => {
        const el = html(
            `<avatar-generator-group avatar-style="initials" items='["ana","ben","chi"]' options='{"size":40}'></avatar-generator-group>`,
        );

        expect(srcOf(el)).toBe(
            createAvatarGroup(initials as Style<AvatarOptions>, ["ana", "ben", "chi"], { size: 40 }).toDataUri(),
        );
    });

    it("renders nothing without items", () => {
        const el = html(`<avatar-generator-group avatar-style="initials"></avatar-generator-group>`);

        expect(srcOf(el)).toBeNull();
    });
});
