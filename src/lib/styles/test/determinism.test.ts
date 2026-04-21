import { describe, expect, it } from "vitest";
import type { AvatarOptions, Style } from "@avatar-generator/core";
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";
import { faces } from "@avatar-generator/style-faces";
import { illustrated } from "@avatar-generator/style-illustrated";
import { anime } from "@avatar-generator/style-anime";
import { abstract } from "@avatar-generator/style-abstract";
import { emoji } from "@avatar-generator/style-emoji";
import { animals } from "@avatar-generator/style-animals";

const styles: Array<[string, Style<AvatarOptions>]> = [
    ["initials", initials as Style<AvatarOptions>],
    ["geometric", geometric as Style<AvatarOptions>],
    ["pixels", pixels as Style<AvatarOptions>],
    ["rings", rings as Style<AvatarOptions>],
    ["faces", faces as Style<AvatarOptions>],
    ["illustrated", illustrated as Style<AvatarOptions>],
    ["anime", anime as Style<AvatarOptions>],
    ["abstract", abstract as Style<AvatarOptions>],
    ["emoji", emoji as Style<AvatarOptions>],
    ["animals", animals as Style<AvatarOptions>],
];

describe.each(styles)("%s style", (name, style) => {
    it("exposes the expected style name", () => {
        expect(style.name).toBe(name);
    });

    it("produces identical SVG for the same seed", () => {
        const a = createAvatar(style, { seed: "Hugo GB" });
        const b = createAvatar(style, { seed: "Hugo GB" });
        expect(a.svg).toBe(b.svg);
    });

    it("produces different SVG for different seeds", () => {
        const a = createAvatar(style, { seed: "seed-one" });
        const b = createAvatar(style, { seed: "seed-two" });
        expect(a.svg).not.toBe(b.svg);
    });

    it("honors the size option", () => {
        const result = createAvatar(style, { seed: "Hugo GB", size: 128 });
        expect(result.svg).toContain(`viewBox="0 0 128 128"`);
        expect(result.svg).toContain(`width="128"`);
        expect(result.svg).toContain(`height="128"`);
    });

    it("uses the provided color palette for the background", () => {
        const result = createAvatar(style, { seed: "Hugo GB", colors: ["#123456"] });
        expect(result.svg).toContain(`fill="#123456"`);
    });

    it("omits the background fill when transparent", () => {
        const result = createAvatar(style, { seed: "Hugo GB", transparent: true, colors: ["#123456"] });
        expect(result.svg).not.toMatch(/<rect x="0" y="0" width="64" height="64" fill="#123456"/);
    });

    it("emits a valid data URI", () => {
        const uri = createAvatar(style, { seed: "Hugo GB" }).toDataUri();
        expect(uri.startsWith("data:image/svg+xml;base64,")).toBe(true);
    });

    it("produces a well-formed SVG wrapper", () => {
        const { svg } = createAvatar(style, { seed: "Hugo GB" });
        expect(svg.startsWith("<svg")).toBe(true);
        expect(svg.endsWith("</svg>")).toBe(true);
    });
});
