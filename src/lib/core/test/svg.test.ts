import { describe, expect, it } from "vitest";
import {
    buildSvg,
    buildTransform,
    createBackground,
    createBorder,
    createCircleClip,
    createSquareClip,
    createSvgOpen,
    DEFAULT_COLORS,
    escapeXml,
    EYE_COLORS,
    SKIN_TONES,
    wrapWithTransform,
} from "@avatar-generator/core";

describe("palettes", () => {
    it("exposes non-empty default palettes", () => {
        expect(DEFAULT_COLORS.length).toBeGreaterThan(0);
        expect(SKIN_TONES.length).toBeGreaterThan(0);
        expect(EYE_COLORS.length).toBeGreaterThan(0);
    });

    it("uses 6-digit hex colors in palettes", () => {
        const allColors = [...DEFAULT_COLORS, ...SKIN_TONES, ...EYE_COLORS];
        for (const color of allColors) {
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });
});

describe("escapeXml", () => {
    it("escapes all XML special characters", () => {
        expect(escapeXml(`<tag a="b" c='d'>&`)).toBe("&lt;tag a=&quot;b&quot; c=&#39;d&#39;&gt;&amp;");
    });

    it("escapes ampersand first so entities don't double-encode", () => {
        expect(escapeXml("&amp;")).toBe("&amp;amp;");
    });

    it("passes through plain text unchanged", () => {
        expect(escapeXml("Hugo GB")).toBe("Hugo GB");
    });
});

describe("createSvgOpen", () => {
    it("emits an SVG opening tag with the given size", () => {
        const svg = createSvgOpen(128);
        expect(svg).toContain(`viewBox="0 0 128 128"`);
        expect(svg).toContain(`width="128"`);
        expect(svg).toContain(`height="128"`);
        expect(svg).toContain(`xmlns="http://www.w3.org/2000/svg"`);
    });
});

describe("createCircleClip / createSquareClip", () => {
    it("creates a circle clip path centered on the avatar", () => {
        const clip = createCircleClip("my-clip", 64);
        expect(clip).toContain(`<clipPath id="my-clip">`);
        expect(clip).toContain(`<circle cx="32" cy="32" r="32"/>`);
    });

    it("creates a square clip path covering the avatar", () => {
        const clip = createSquareClip("sq", 64);
        expect(clip).toContain(`<rect x="0" y="0" width="64" height="64"/>`);
    });
});

describe("createBackground", () => {
    it("returns a filled rect when not transparent", () => {
        const bg = createBackground(64, "#FF0000");
        expect(bg).toContain(`fill="#FF0000"`);
        expect(bg).toContain(`width="64"`);
    });

    it("returns an empty string when transparent", () => {
        expect(createBackground(64, "#FF0000", true)).toBe("");
    });
});

describe("createBorder", () => {
    it("creates a circle border by default", () => {
        const border = createBorder(64, 2, "#000", false);
        expect(border).toContain("<circle");
        expect(border).toContain(`stroke="#000"`);
        expect(border).toContain(`stroke-width="2"`);
    });

    it("creates a rect border when square", () => {
        const border = createBorder(64, 2, "#000", true);
        expect(border).toContain("<rect");
        expect(border).toContain(`stroke="#000"`);
    });
});

describe("buildTransform", () => {
    it("returns empty string when no transforms are applied", () => {
        expect(buildTransform({ seed: "x" })).toBe("");
    });

    it("emits rotate when rotate option is set", () => {
        const t = buildTransform({ seed: "x", size: 64, rotate: 45 });
        expect(t).toContain("rotate(45 32 32)");
    });

    it("emits flip transform when flip is true", () => {
        const t = buildTransform({ seed: "x", size: 64, flip: true });
        expect(t).toContain("scale(-1, 1)");
        expect(t).toContain("translate(-64, 0)");
    });

    it("emits scale transform when scale differs from 1", () => {
        const t = buildTransform({ seed: "x", size: 64, scale: 0.5 });
        expect(t).toContain("scale(0.5)");
    });

    it("omits scale transform when scale is exactly 1", () => {
        const t = buildTransform({ seed: "x", size: 64, scale: 1 });
        expect(t).toBe("");
    });
});

describe("wrapWithTransform", () => {
    it("returns raw content when no transform is needed", () => {
        expect(wrapWithTransform("<rect/>", { seed: "x" })).toBe("<rect/>");
    });

    it("wraps content in a transformed group when a transform is set", () => {
        const out = wrapWithTransform("<rect/>", { seed: "x", rotate: 90 });
        expect(out).toMatch(/^<g transform="[^"]+"><rect\/><\/g>$/);
    });
});

describe("buildSvg", () => {
    it("returns an SVG string and toDataUri function", () => {
        const result = buildSvg("<rect/>", { seed: "s" }, "#FF0000");
        expect(result.svg.startsWith("<svg")).toBe(true);
        expect(result.svg.endsWith("</svg>")).toBe(true);
        expect(typeof result.toDataUri).toBe("function");
    });

    it("uses circle clip by default and square when requested", () => {
        const circle = buildSvg("<rect/>", { seed: "s" }, "#FFF").svg;
        const square = buildSvg("<rect/>", { seed: "s", square: true }, "#FFF").svg;
        expect(circle).toContain("<circle");
        expect(square).not.toMatch(/<clipPath[^>]*>\s*<circle/);
        expect(square).toMatch(/<clipPath[^>]*><rect/);
    });

    it("omits background fill when transparent", () => {
        const svg = buildSvg("<rect/>", { seed: "s", transparent: true }, "#FF0000").svg;
        expect(svg).not.toContain(`fill="#FF0000"`);
    });

    it("adds a border when provided", () => {
        const svg = buildSvg("<rect/>", { seed: "s", border: { width: 4, color: "#000" } }, "#FFF").svg;
        expect(svg).toContain(`stroke="#000"`);
        expect(svg).toContain(`stroke-width="4"`);
    });

    it("produces a valid data URI", () => {
        const uri = buildSvg("<rect/>", { seed: "s" }, "#FFF").toDataUri();
        expect(uri.startsWith("data:image/svg+xml;base64,")).toBe(true);
    });
});
