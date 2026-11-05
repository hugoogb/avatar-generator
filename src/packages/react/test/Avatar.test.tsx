// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createAvatar, createAvatarGroup } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar, AvatarGroup } from "@avatar-generator/react";

afterEach(cleanup);

const img = () => screen.getByRole("img") as HTMLImageElement;

describe("<Avatar /> (react)", () => {
    it("renders an img whose src is the avatar data URI", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} />);

        expect(img().src).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("renders the same avatar the core API produces for that seed", () => {
        render(<Avatar style={geometric} options={{ seed: "user-42", size: 128 }} />);

        expect(img().src).toBe(createAvatar(geometric, { seed: "user-42", size: 128 }).toDataUri());
    });

    it('defaults alt to "Avatar" so the image is never unlabelled', () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} />);

        expect(img().alt).toBe("Avatar");
    });

    it("uses the supplied alt text", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} alt="Hugo García" />);

        expect(screen.getByAltText("Hugo García")).toBeDefined();
    });

    it("sizes the element from options.size", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB", size: 96 }} />);

        expect(img().getAttribute("width")).toBe("96");
        expect(img().getAttribute("height")).toBe("96");
    });

    it("falls back to 64px when no size is given", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} />);

        expect(img().getAttribute("width")).toBe("64");
        expect(img().getAttribute("height")).toBe("64");
    });

    it("applies className", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} className="rounded border" />);

        expect(img().className).toBe("rounded border");
    });

    it("re-renders when the seed changes", () => {
        const { rerender } = render(<Avatar style={initials} options={{ seed: "first" }} />);
        const before = img().src;

        rerender(<Avatar style={initials} options={{ seed: "second" }} />);

        expect(img().src).not.toBe(before);
        expect(img().src).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("re-renders when the style changes", () => {
        const { rerender } = render(<Avatar style={initials} options={{ seed: "same-seed" }} />);
        const before = img().src;

        rerender(<Avatar style={geometric} options={{ seed: "same-seed" }} />);

        expect(img().src).not.toBe(before);
    });

    it("renders the same output for the same seed across separate mounts", () => {
        const { unmount } = render(<Avatar style={initials} options={{ seed: "stable" }} />);
        const first = img().src;
        unmount();

        render(<Avatar style={initials} options={{ seed: "stable" }} />);

        expect(img().src).toBe(first);
    });
});

describe("<AvatarGroup /> (react)", () => {
    const seeds = ["ana", "ben", "chi"];

    it("renders the group the core API produces", () => {
        render(<AvatarGroup style={initials} items={seeds} options={{ size: 40 }} />);
        const group = createAvatarGroup(initials, seeds, { size: 40 });
        const image = screen.getByRole("img") as HTMLImageElement;

        expect(image.src).toBe(group.toDataUri());
        expect(image.getAttribute("width")).toBe(String(group.width));
        expect(image.getAttribute("height")).toBe(String(group.height));
    });

    it("defaults alt to the group's label", () => {
        render(<AvatarGroup style={initials} items={seeds} />);
        expect(screen.getByAltText("3 avatars")).toBeDefined();
    });

    it("prefers explicit alt, including an empty one for decoration", () => {
        const { container } = render(<AvatarGroup style={initials} items={seeds} alt="" />);
        expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
    });

    it("passes className through", () => {
        render(<AvatarGroup style={initials} items={seeds} className="team" />);
        expect(screen.getByRole("img").className).toBe("team");
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

describe("viewer preferences (react)", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("does not animate for a viewer who prefers reduced motion", () => {
        stubMatchMedia("reduced-motion");
        render(<Avatar style={initials} options={{ seed: "x", animation: true }} />);
        expect(img().src).toBe(createAvatar(initials, { seed: "x" }).toDataUri());
    });

    it("animates otherwise", () => {
        stubMatchMedia("nothing");
        render(<Avatar style={initials} options={{ seed: "x", animation: true }} />);
        expect(img().src).toBe(createAvatar(initials, { seed: "x", animation: true }).toDataUri());
    });

    it("uses high contrast for the auto theme when asked", () => {
        stubMatchMedia("contrast");
        render(<Avatar style={initials} options={{ seed: "x", theme: "auto" }} />);
        expect(img().src).toBe(createAvatar(initials, { seed: "x", theme: "high-contrast" }).toDataUri());
    });

    it("applies to groups", () => {
        stubMatchMedia("reduced-motion");
        render(<AvatarGroup style={initials} items={["a"]} options={{ options: { animation: true } }} />);
        expect(img().src).toBe(createAvatarGroup(initials, ["a"]).toDataUri());
    });

    it("stops listening on unmount", () => {
        const listeners = stubMatchMedia("nothing");
        const { unmount } = render(<Avatar style={initials} options={{ seed: "x" }} />);
        expect(listeners.size).toBeGreaterThan(0);
        unmount();
        expect(listeners.size).toBe(0);
    });
});
