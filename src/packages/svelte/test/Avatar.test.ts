// @vitest-environment happy-dom
import { createAvatar, createAvatarGroup } from "@avatar-generator/core";
// Imported from source: the package entry is the raw component, resolved
// through the `svelte` export condition, which neither tsc nor vitest read.
import Avatar from "../src/Avatar.svelte";
import AvatarGroup from "../src/AvatarGroup.svelte";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { cleanup, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

const img = () => screen.getByRole("img") as HTMLImageElement;

describe("<Avatar /> (svelte)", () => {
    it("renders an img whose src is the avatar data URI", () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB" } });

        expect(img().src).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("renders the same avatar the core API produces for that seed", () => {
        render(Avatar, { style: geometric, options: { seed: "user-42", size: 128 } });

        expect(img().src).toBe(createAvatar(geometric, { seed: "user-42", size: 128 }).toDataUri());
    });

    it('defaults alt to "Avatar" so the image is never unlabelled', () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB" } });

        expect(img().alt).toBe("Avatar");
    });

    it("uses the supplied alt text", () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB" }, alt: "Hugo García" });

        expect(screen.getByAltText("Hugo García")).toBeDefined();
    });

    it("sizes the element from options.size", () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB", size: 96 } });

        expect(img().getAttribute("width")).toBe("96");
        expect(img().getAttribute("height")).toBe("96");
    });

    it("falls back to 64px when no size is given", () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB" } });

        expect(img().getAttribute("width")).toBe("64");
        expect(img().getAttribute("height")).toBe("64");
    });

    // `class` is a reserved word, so the component exports it as `className`
    // renamed via `export { className as class }`. That rename is easy to break.
    it("applies the class prop", () => {
        render(Avatar, { style: initials, options: { seed: "Hugo GB" }, class: "rounded" });

        expect(img().getAttribute("class")).toBe("rounded");
    });

    it("re-renders when the seed changes", async () => {
        const { rerender } = render(Avatar, { style: initials, options: { seed: "first" } });
        const before = img().src;

        await rerender({ style: initials, options: { seed: "second" } });

        expect(img().src).not.toBe(before);
        expect(img().src).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("re-renders when the style changes", async () => {
        const { rerender } = render(Avatar, { style: initials, options: { seed: "same-seed" } });
        const before = img().src;

        await rerender({ style: geometric, options: { seed: "same-seed" } });

        expect(img().src).not.toBe(before);
    });

    it("renders the same output for the same seed across separate mounts", () => {
        const { unmount } = render(Avatar, { style: initials, options: { seed: "stable" } });
        const first = img().src;
        unmount();

        render(Avatar, { style: initials, options: { seed: "stable" } });

        expect(img().src).toBe(first);
    });
});

describe("<AvatarGroup /> (svelte)", () => {
    const seeds = ["ana", "ben", "chi"];

    it("renders the group the core API produces", () => {
        render(AvatarGroup, { style: initials, items: seeds, options: { size: 40 } });
        const group = createAvatarGroup(initials, seeds, { size: 40 });

        expect(img().src).toBe(group.toDataUri());
        expect(img().getAttribute("width")).toBe(String(group.width));
    });

    it("defaults alt to the group's label and prefers an explicit one", () => {
        render(AvatarGroup, { style: initials, items: seeds });
        expect(img().alt).toBe("3 avatars");
        cleanup();
        render(AvatarGroup, { style: initials, items: seeds, alt: "Team" });
        expect(img().alt).toBe("Team");
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

describe("viewer preferences (svelte)", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("does not animate for a viewer who prefers reduced motion", async () => {
        stubMatchMedia("reduced-motion");
        render(Avatar, { style: initials, options: { seed: "x", animation: true } });
        await tick();
        expect(img().src).toBe(createAvatar(initials, { seed: "x" }).toDataUri());
    });

    it("applies to groups", async () => {
        stubMatchMedia("reduced-motion");
        render(AvatarGroup, { style: initials, items: ["a"], options: { options: { animation: true } } });
        await tick();
        expect(img().src).toBe(createAvatarGroup(initials, ["a"]).toDataUri());
    });
});
