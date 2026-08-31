// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "@avatar-generator/react";

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
