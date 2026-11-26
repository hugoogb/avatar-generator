import { describe, expect, it } from "vitest";
import { contrastRatio, createAvatar, createRandom, DEFAULT_COLORS } from "@avatar-generator/core";
import { marks, SYMBOLS } from "@avatar-generator/style-marks";
import type { MarksOptions } from "@avatar-generator/style-marks";

const SEEDS = Array.from({ length: 120 }, (_, i) => `seed-${i}`);

const render = (options: MarksOptions) => createAvatar(marks, options).svg;

/** Every colour painted after the background, in order. */
function paints(svg: string): string[] {
    const art = svg.replace(/<rect x="0" y="0" width="64" height="64" fill="[^"]+"\/>/, "").split("</defs>")[1];
    return [...art.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{3,6})"/g)].map((match) => match[1]);
}

const letterOf = (svg: string) => /<text[^>]*>([^<]*)<\/text>/.exec(svg)?.[1];

describe("options", () => {
    it("rejects an unknown symbol", () => {
        expect(() => render({ seed: "x", symbol: "logo" as never })).toThrow(/Invalid symbol: "logo"/);
    });

    it("draws every symbol, each one differently", () => {
        const drawn = SYMBOLS.map((symbol) => render({ seed: "Acme Inc", symbol }));
        for (const svg of drawn) expect(paints(svg).length).toBeGreaterThan(0);
        expect(new Set(drawn).size).toBe(SYMBOLS.length);
    });

    it("picks every symbol by itself", () => {
        const picked = new Set(SEEDS.map((seed) => marks.prepare({ seed }, createRandom(seed)).symbol));
        expect([...picked].sort()).toEqual([...SYMBOLS].sort());
    });

    it("keeps the symbol's colour and background when a symbol is pinned", () => {
        const free = marks.prepare({ seed: "x" }, createRandom("x"));
        const pinned = marks.prepare({ seed: "x", symbol: "wave" }, createRandom("x"));
        expect(pinned.background).toBe(free.background);
        expect(pinned.ink).toBe(free.ink);
    });

    it.each([
        { square: true },
        { theme: "dark" },
        { theme: "high-contrast" },
        { theme: "auto" },
        { animation: true },
        { colors: ["#123456"] },
        { letter: true, square: true },
    ] as Partial<MarksOptions>[])("renders with %o", (options) => {
        for (const seed of SEEDS.slice(0, 20)) {
            const svg = render({ seed, ...options });
            expect(svg).toMatch(/^<svg /);
            expect(svg).not.toContain("undefined");
            expect(svg).not.toContain("NaN");
        }
    });
});

describe("contrast", () => {
    it("keeps the symbol at 3:1 on every default colour", () => {
        for (const background of DEFAULT_COLORS) {
            for (const symbol of SYMBOLS) {
                for (const seed of SEEDS.slice(0, 12)) {
                    const used = paints(render({ seed, symbol, colors: [background] }));
                    for (const color of used) {
                        expect(
                            contrastRatio(color, background),
                            `${background} ${symbol} ${seed}`,
                        ).toBeGreaterThanOrEqual(3);
                    }
                }
            }
        }
    });

    it("keeps the letter at 4.5:1 on its badge on every default colour", () => {
        for (const background of DEFAULT_COLORS) {
            for (const seed of SEEDS.slice(0, 12)) {
                const [badge, text] = paints(render({ seed, letter: true, colors: [background] }));
                expect(contrastRatio(badge, background), background).toBeGreaterThanOrEqual(4.5);
                expect(contrastRatio(text, badge), background).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    it("uses the theme's foreground", () => {
        expect(paints(render({ seed: "x", theme: "light" }))).toContain("#1F2933");
        expect(new Set(paints(render({ seed: "x", theme: "dark" })))).toEqual(new Set(["#FFFFFF"]));
    });

    it("does not assume a page colour when transparent", () => {
        for (const seed of SEEDS.slice(0, 40)) {
            const svg = render({ seed, transparent: true });
            for (const color of paints(svg)) expect(DEFAULT_COLORS).toContain(color);
        }
    });

    it("colours a transparent letter's badge from the palette and keeps the letter readable on it", () => {
        for (const seed of SEEDS.slice(0, 40)) {
            const [badge, text] = paints(render({ seed, letter: true, transparent: true }));
            expect(DEFAULT_COLORS).toContain(badge);
            expect(contrastRatio(text, badge), seed).toBeGreaterThanOrEqual(4.5);
        }
    });
});

describe("letter", () => {
    it.each([
        ["Acme Inc", "A"],
        ["acme", "A"],
        ["ben@example.com", "B"],
        ["@handle", "H"],
        ["🚀 Launch", "L"],
        ["李华", "李"],
        ["émile", "É"],
        ["ангел", "А"],
        ["123 Studio", "1"],
        ["ß-labs", "S"],
        ["a&b", "A"],
    ])("badges %s with %s", (seed, letter) => {
        expect(letterOf(render({ seed, letter: true }))).toBe(letter);
    });

    it("escapes the letter", () => {
        expect(render({ seed: "<b>", letter: true })).toContain(">B</text>");
    });

    it("keeps the symbol when the seed has no letter", () => {
        for (const seed of ["🚀", "...", "  "]) {
            expect(render({ seed, letter: true })).toBe(render({ seed }));
        }
    });

    it("draws no letter unless asked", () => {
        expect(render({ seed: "Acme Inc" })).not.toContain("<text");
    });
});

describe("artwork", () => {
    it.each([{}, { letter: true }])("is the same at every size with %o", (options) => {
        const at = (size: number) => render({ seed: "x", size, ...options }).replace(/ width="\d+" height="\d+"/, "");
        expect(at(256)).toBe(at(32));
    });

    it("is deterministic", () => {
        for (const seed of SEEDS.slice(0, 20)) expect(render({ seed })).toBe(render({ seed }));
    });

    it("gives sixteen organisations sixteen different marks", () => {
        const names = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka"];
        const seeds = [...names, ...names.map((name) => `${name} Labs`)];
        const marksDrawn = seeds.map((seed) => render({ seed }));
        expect(new Set(marksDrawn).size).toBe(16);

        // Ignoring colour, most should still differ in shape.
        const shapes = seeds.map((seed) => {
            const { symbol, variant, turn } = marks.prepare({ seed }, createRandom(seed));
            return `${symbol} ${variant} ${turn}`;
        });
        expect(new Set(shapes).size).toBeGreaterThanOrEqual(12);
    });
});
