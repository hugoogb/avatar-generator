import { describe, expect, it } from "vitest";
import { contrastRatio, createAvatar, DEFAULT_COLORS, mixStyles } from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import { EYE_STYLES, HAIR_STYLES, MOUTH_STYLES, portraits } from "@avatar-generator/style-portraits";
import type { AvatarOptions, Style } from "@avatar-generator/core";
import type { PortraitsOptions } from "@avatar-generator/style-portraits";

const SEEDS = Array.from({ length: 120 }, (_, i) => `seed-${i}`);

const render = (options: PortraitsOptions) => createAvatar(portraits, options).svg;
const backgroundOf = (svg: string) => /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(svg)?.[1] as string;
/** The face outline is drawn in the ink. */
const inkOf = (svg: string) => /<path d="M 32 13 [^"]*" fill="[^"]+" stroke="([^"]+)"/.exec(svg)?.[1] as string;

describe("options", () => {
    it.each([
        ["hairStyle", "mohawk"],
        ["eyeStyle", "sparkly"],
        ["mouthStyle", "frown"],
    ])("rejects an unknown %s", (option, value) => {
        expect(() => render({ seed: "x", [option]: value })).toThrow(/style-portraits\] Invalid/);
    });

    it.each([
        ["hairStyle", HAIR_STYLES],
        ["eyeStyle", EYE_STYLES],
        ["mouthStyle", MOUTH_STYLES],
    ] as const)("draws every %s differently", (option, values) => {
        const drawn = values.map((value) => render({ seed: "x", [option]: value }));
        expect(new Set(drawn).size).toBe(values.length);
    });

    it("draws glasses and facial hair only when asked", () => {
        for (const seed of SEEDS.slice(0, 20)) {
            const layers = (options: Partial<PortraitsOptions>) => render({ classes: true, ...options, seed });
            expect(layers({ glasses: true })).toContain("ag-layer-glasses");
            expect(layers({ glasses: false })).not.toContain("ag-layer-glasses");
            expect(layers({ facialHair: true })).toContain("ag-layer-facial-hair");
            expect(layers({ facialHair: false })).not.toContain("ag-layer-facial-hair");
        }
    });

    it("draws in the ink it is given", () => {
        const svg = render({ seed: "x", ink: "#0B3D91" });
        expect(inkOf(svg)).toBe("#0B3D91");
    });
});

describe("ink", () => {
    it("reads at 4.5:1 on every default background", () => {
        const seen = new Set<string>();
        for (const seed of SEEDS) {
            const svg = render({ seed });
            const background = backgroundOf(svg);
            seen.add(background);
            expect(contrastRatio(inkOf(svg), background), seed).toBeGreaterThanOrEqual(4.5);
        }
        expect([...seen].sort()).toEqual([...DEFAULT_COLORS].sort());
    });

    it("follows the background a theme picks", () => {
        for (const theme of ["light", "dark", "high-contrast"] as const) {
            for (const seed of SEEDS.slice(0, 20)) {
                const svg = render({ seed, theme });
                expect(contrastRatio(inkOf(svg), backgroundOf(svg)), `${theme} ${seed}`).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    it("does not assume a page colour when transparent", () => {
        for (const seed of SEEDS.slice(0, 40)) {
            const svg = render({ seed, transparent: true });
            expect(svg).not.toMatch(/<rect x="0" y="0"/);
            // A palette mid-tone holds up on light and dark pages, where black or white would vanish.
            expect(DEFAULT_COLORS).toContain(inkOf(svg));
            expect(svg).toContain('fill="none"');
        }
    });
});

describe("brow line", () => {
    /** Every point a path passes through or bends towards, arcs by their end points. */
    const points = (markup: string): [number, number][] => {
        const found: [number, number][] = [];
        for (const [, d] of markup.matchAll(/ d="([^"]+)"/g)) {
            for (const [, command, args] of d.matchAll(/([MLCQA])([^MLCQAZ]*)/g)) {
                const numbers = args
                    .trim()
                    .split(/[\s,]+/)
                    .filter(Boolean)
                    .map(Number);
                const pairs = command === "A" ? [numbers.slice(5)] : [];
                if (command !== "A") for (let i = 0; i < numbers.length; i += 2) pairs.push(numbers.slice(i, i + 2));
                for (const [x, y] of pairs) found.push([x, y]);
            }
        }
        return found;
    };
    const layer = (svg: string, name: string) =>
        new RegExp(`ag-layer-${name}">(.*?)</g>(?=<g class="ag-layer|$)`).exec(svg)?.[1] ?? "";

    it.each(HAIR_STYLES)("keeps a %s fringe clear above the brows", (hairStyle) => {
        for (const seed of SEEDS.slice(0, 20)) {
            const hair = layer(render({ seed, hairStyle, classes: true }), "hair-front");
            // Brows span x 22.6–41.4 and their top edge sits at y 22.1 or lower.
            if (hairStyle !== "bald") expect(points(hair).length).toBeGreaterThan(4);
            const low = points(hair).filter(([x, y]) => x > 22.6 && x < 41.4 && y > 21);
            expect(low, `${hairStyle} ${seed}`).toEqual([]);
        }
    });

    it("lets glasses frames stand in for the brows", () => {
        for (const seed of SEEDS.slice(0, 20)) {
            expect(render({ seed, glasses: true, classes: true })).not.toContain("ag-layer-eyebrows");
            expect(render({ seed, glasses: false, classes: true })).toContain("ag-layer-eyebrows");
        }
    });
});

describe("artwork", () => {
    it("draws the same artwork at every size", () => {
        const at = (size: number, hairStyle?: PortraitsOptions["hairStyle"]) =>
            render({ seed: "x", size, hairStyle }).replace(/ width="\d+" height="\d+"/, "");
        for (const hairStyle of [undefined, ...HAIR_STYLES]) {
            expect(at(256, hairStyle)).toBe(at(32, hairStyle));
        }
    });

    it("gives different seeds different people", () => {
        const people = SEEDS.slice(0, 16).map((seed) => {
            // Ignore the background, so only the person is compared.
            const svg = render({ seed, transparent: true });
            return svg.replace(/#[0-9A-F]{6}/gi, "");
        });
        expect(new Set(people).size).toBe(16);
    });

    it("works with every shared option", () => {
        for (const seed of SEEDS.slice(0, 10)) {
            for (const options of [
                { square: true },
                { animation: true },
                { colors: ["#123456"] },
                { theme: "auto" },
                { transparent: true, glasses: true, facialHair: true },
            ] as Partial<PortraitsOptions>[]) {
                const svg = render({ ...options, seed });
                expect(svg).not.toContain("undefined");
                expect(svg).not.toContain("NaN");
            }
        }
    });

    it("names its eyes layer so blink reaches it", () => {
        expect(render({ seed: "x", animation: "blink" })).toContain('class="ag-layer ag-layer-eyes"');
    });

    it("mixes with faces both ways", () => {
        const onFaces = mixStyles(faces, { hair: portraits, glasses: portraits, mouth: portraits });
        const onPortraits = mixStyles(portraits, { eyes: faces, hair: faces, nose: null });
        for (const seed of SEEDS.slice(0, 20)) {
            for (const style of [onFaces, onPortraits] as Style<AvatarOptions>[]) {
                const { svg } = createAvatar(style, { seed });
                expect(svg).not.toContain("undefined");
                expect(svg).not.toContain("NaN");
            }
        }
    });
});
