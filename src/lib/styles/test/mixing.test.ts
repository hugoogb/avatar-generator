import { describe, expect, it } from "vitest";
import { createAvatar, defineStyle, mixStyles, type AvatarOptions, type Style } from "@avatar-generator/core";
import { abstract } from "@avatar-generator/style-abstract";
import { animals, ANIMALS } from "@avatar-generator/style-animals";
import { anime } from "@avatar-generator/style-anime";
import { emoji } from "@avatar-generator/style-emoji";
import { faces } from "@avatar-generator/style-faces";
import { geometric } from "@avatar-generator/style-geometric";
import { gradient } from "@avatar-generator/style-gradient";
import { illustrated } from "@avatar-generator/style-illustrated";
import { initials } from "@avatar-generator/style-initials";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";

const SEEDS = Array.from({ length: 40 }, (_, i) => `seed-${i}`);

const layerNames = (svg: string) => [...svg.matchAll(/ag-layer-([\w-]+)/g)].map((m) => m[1]);

describe("the face styles' feature vocabulary", () => {
    it.each([
        ["faces", faces],
        ["illustrated", illustrated],
        ["anime", anime],
    ])("%s exposes the features the others can trade", (_name, style) => {
        const features = new Set(style.layers.map((layer) => layer.feature ?? layer.name));
        for (const feature of ["hair", "ears", "head", "eyes", "eyebrows", "nose", "mouth"]) {
            expect(features).toContain(feature);
        }
    });
});

describe("mixing the bundled styles", () => {
    it("takes illustrated hair and faces eyes, the roadmap's example", () => {
        const mixed = mixStyles(faces, { hair: illustrated });
        for (const seed of SEEDS) {
            const { svg } = createAvatar(mixed, { seed, classes: true });
            expect(svg).not.toContain("undefined");
            expect(layerNames(svg)).toContain("eyes");
        }
    });

    it("is pure: an unmixed feature is byte-identical to the base", () => {
        const eyesOf = (svg: string) => /<g class="ag-layer ag-layer-eyes">(.*?)<\/g>/.exec(svg)?.[1];
        const mixed = mixStyles(faces, { hair: illustrated, mouth: anime });
        for (const seed of SEEDS) {
            expect(eyesOf(createAvatar(mixed, { seed, classes: true }).svg)).toBe(
                eyesOf(createAvatar(faces, { seed, classes: true }).svg),
            );
        }
    });

    it("draws a donor feature with the donor's choices, mapped onto the base's head", () => {
        const eyesOf = (svg: string) => /<g class="ag-layer ag-layer-eyes">(.*?)<\/g><\/?g/.exec(svg)?.[1];
        const mixed = mixStyles(faces, { eyes: illustrated });
        for (const seed of SEEDS) {
            const donor = createAvatar(illustrated, { seed, classes: true }).svg;
            const inner = /ag-layer-eyes">(.*?)<\/g>/.exec(donor)?.[1] as string;
            const drawn = eyesOf(createAvatar(mixed, { seed, classes: true }).svg) as string;
            expect(drawn).toContain(inner);
            expect(drawn).toMatch(/^<g transform="translate\([-\d. ]+\) scale\([\d. ]+\)">/);
        }
    });

    it.each([
        ["faces", faces],
        ["illustrated", illustrated],
        ["anime", anime],
    ])("maps %s's head box exactly onto faces' when mixing", (_name, donor) => {
        const from = donor.head?.(64);
        const to = faces.head?.(64);
        const svg = createAvatar(mixStyles(faces, { eyes: donor }), { seed: "x", classes: true }).svg;
        if (donor === faces) {
            expect(svg).not.toContain('<g transform="translate');
            return;
        }
        const match = /<g transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+) ([\d.]+)\)">/.exec(svg);
        const [tx, ty, sx, sy] = (match as RegExpExecArray).slice(1).map(Number);
        expect(tx + (from?.x as number) * sx).toBeCloseTo(to?.x as number, 2);
        expect(ty + (from?.y as number) * sy).toBeCloseTo(to?.y as number, 2);
        expect((from?.width as number) * sx).toBeCloseTo(to?.width as number, 2);
        expect((from?.height as number) * sy).toBeCloseTo(to?.height as number, 2);
    });

    it("leaves output unchanged when a style has no head box to align to", () => {
        const plain = defineStyle({ name: "plain", layers: [{ name: "eyes", render: () => "<i/>" }] });
        const { svg } = createAvatar(mixStyles(faces, { eyes: plain }), { seed: "x" });
        expect(svg).toContain("<i/>");
        expect(svg).not.toContain('<g transform="translate');
    });

    it("keeps a base option that a donor would reject away from it", () => {
        const mixed = mixStyles(faces, { eyes: illustrated });
        expect(() => createAvatar(mixed, { seed: "x", hairStyle: "flat-top" })).not.toThrow();
    });

    it("forwards donor options to the donor's validation", () => {
        const mixed = mixStyles(faces, { eyes: { style: anime, options: { eyeStyle: "nope" } } });
        expect(() => createAvatar(mixed, { seed: "x" })).toThrow(/style-anime.*eyeStyle/);
    });

    it("adds illustrated's glasses to faces, which has none", () => {
        const withGlasses = mixStyles(faces, { glasses: { style: illustrated, options: {} } });
        const names = withGlasses.layers.map((layer) => layer.name);
        expect(names).toContain("glasses");
    });
});

describe("blink reaches every style with eyes", () => {
    const withEyes: Array<[string, Style<AvatarOptions>]> = [
        ["faces", faces as Style<AvatarOptions>],
        ["illustrated", illustrated as Style<AvatarOptions>],
        ["anime", anime as Style<AvatarOptions>],
        ["emoji", emoji as Style<AvatarOptions>],
        ["pixels", pixels as Style<AvatarOptions>],
        ["animals", animals as Style<AvatarOptions>],
    ];

    it.each(withEyes)("%s", (_name, style) => {
        for (const seed of SEEDS) {
            const { svg } = createAvatar(style, { seed, animation: "blink" });
            expect(svg.match(/ag-layer-eyes"/g), seed).toHaveLength(1);
        }
    });

    it.each(ANIMALS)("animals: %s has markup in its eye group, and no marker leaks", (animal) => {
        const animated = createAvatar(animals, { seed: "x", animal, animation: "blink" }).svg;
        expect(animated).toMatch(/ag-layer-eyes"><(circle|ellipse)/);
        expect(animated).not.toContain("\u0000");

        const plain = createAvatar(animals, { seed: "x", animal }).svg;
        expect(plain).not.toContain("\u0000");
    });

    it("does not lose or alter pixels when grouping eyes", () => {
        const rects = (svg: string) => (svg.match(/<rect /g) ?? []).length;
        for (const seed of SEEDS) {
            expect(rects(createAvatar(pixels, { seed, animation: "blink" }).svg)).toBe(
                rects(createAvatar(pixels, { seed }).svg),
            );
        }
    });
});

describe("options stay opt-in for every style", () => {
    const all: Array<[string, Style<AvatarOptions>]> = [
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
        ["gradient", gradient as Style<AvatarOptions>],
    ];

    it.each(all)("%s renders every new option", (_name, style) => {
        for (const seed of SEEDS.slice(0, 10)) {
            for (const options of [
                { theme: "auto" },
                { theme: "high-contrast" },
                { animation: true },
                { classes: "me" },
                { title: "李" },
            ] as Partial<AvatarOptions>[]) {
                const result = createAvatar(style, { seed, ...options });
                expect(result.svg).toMatch(/^<svg /);
                expect(result.svg).not.toContain("undefined");
                expect(result.toDataUri()).toMatch(/^data:image\/svg\+xml;base64,/);
            }
        }
    });

    it("gradient keeps a distinct gradient per auto-theme drawing", () => {
        const { svg } = createAvatar(gradient, { seed: "x", theme: "auto" });
        const ids = [...svg.matchAll(/<(?:linear|radial)Gradient id="([^"]+)"/g)].map((m) => m[1]);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
    });
});

describe("theme foreground", () => {
    it("recolours initials text, and textColor still wins", () => {
        expect(createAvatar(initials, { seed: "Ana", theme: "light" }).svg).toContain('fill="#1F2933"');
        expect(createAvatar(initials, { seed: "Ana", theme: "light", textColor: "#123" }).svg).toContain('fill="#123"');
    });

    it("recolours geometric while keeping its pattern", () => {
        const cells = (svg: string) => [...svg.matchAll(/<rect x="(\d+\.?\d*)" y="(\d+\.?\d*)"/g)].map((m) => m[0]);
        const light = createAvatar(geometric, { seed: "x", theme: "light" }).svg;
        const dark = createAvatar(geometric, { seed: "x", theme: "dark" }).svg;
        expect(light).toContain('fill="#1F2933"');
        expect(dark).toContain('fill="#FFFFFF"');
        expect(cells(light)).toEqual(cells(dark));
    });

    it("handles an initial outside the basic plane", () => {
        const result = createAvatar(initials, { seed: "🙂 Ana" });
        expect(result.svg).toContain("🙂");
        expect(() => result.toDataUri()).not.toThrow();
    });
});
