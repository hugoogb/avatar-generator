import { describe, expect, it } from "vitest";
import {
    contrastRatio,
    createAvatar,
    createRandom,
    DARK_THEME,
    DEFAULT_COLORS,
    HIGH_CONTRAST_THEME,
    LIGHT_THEME,
    mixStyles,
} from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import {
    ANTENNAS,
    EYE_STYLES,
    HEAD_SHAPES,
    METAL_COLORS,
    MOUTH_STYLES,
    robots,
    type RobotsOptions,
} from "@avatar-generator/style-robots";

const SEEDS = Array.from({ length: 200 }, (_, i) => `robot-${i}`);

const backgroundOf = (svg: string) => /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(svg)?.[1] as string;
const traitsOf = (options: RobotsOptions) => robots.prepare(options, createRandom(options.seed));

describe("robots options", () => {
    it.each([
        ["headShape", "triangle"],
        ["antenna", "horns"],
        ["eyeStyle", "angry"],
        ["mouthStyle", "fangs"],
    ])("rejects an unknown %s", (option, value) => {
        expect(() => createAvatar(robots, { seed: "x", [option]: value } as RobotsOptions)).toThrow(
            new RegExp(`Invalid ${option}: "${value}"`),
        );
    });

    it("rejects an empty metal palette", () => {
        expect(() => createAvatar(robots, { seed: "x", metalColors: [] })).toThrow(/metalColors/);
    });

    it.each([
        ...HEAD_SHAPES.map((value) => ({ headShape: value })),
        ...ANTENNAS.map((value) => ({ antenna: value })),
        ...EYE_STYLES.map((value) => ({ eyeStyle: value })),
        ...MOUTH_STYLES.map((value) => ({ mouthStyle: value })),
    ])("renders %o", (option) => {
        const options = { seed: "x", ...option } as RobotsOptions;
        expect(traitsOf(options)).toMatchObject(option);
        expect(createAvatar(robots, options).svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
    });

    it("draws each value differently", () => {
        const options = [
            ...HEAD_SHAPES.map((headShape) => ({ headShape })),
            ...ANTENNAS.map((antenna) => ({ antenna })),
            ...EYE_STYLES.map((eyeStyle) => ({ eyeStyle })),
            ...MOUTH_STYLES.map((mouthStyle) => ({ mouthStyle })),
        ];
        const pinned = { headShape: "box", antenna: "ball", eyeStyle: "round", mouthStyle: "grille" } as const;
        const drawn = new Set(options.map((o) => createAvatar(robots, { seed: "x", ...pinned, ...o }).svg));
        // Each option's values differ from each other; the pinned defaults repeat once per option.
        expect(drawn.size).toBe(options.length - 3);
    });

    it("leaves the seed's other choices alone when one trait is pinned", () => {
        for (const seed of SEEDS.slice(0, 40)) {
            const free = traitsOf({ seed });
            const pinned = traitsOf({ seed, eyeStyle: "cyclops" });
            expect({ ...pinned, eyeStyle: free.eyeStyle }, seed).toEqual(free);
        }
    });

    it("uses a custom metal palette", () => {
        for (const seed of SEEDS.slice(0, 20)) {
            expect(traitsOf({ seed, metalColors: ["#123ABC"] }).metal).toBe("#123ABC");
        }
    });
});

describe("robots colour", () => {
    it("keeps the robot apart from its background", () => {
        for (const seed of SEEDS) {
            const { svg } = createAvatar(robots, { seed });
            const { metal } = traitsOf({ seed });
            expect(contrastRatio(metal, backgroundOf(svg)), seed).toBeGreaterThanOrEqual(1.6);
        }
    });

    it.each([
        ["default", DEFAULT_COLORS],
        ["light", LIGHT_THEME.colors],
        ["dark", DARK_THEME.colors],
        ["high-contrast", HIGH_CONTRAST_THEME.colors],
    ])("finds a distinct metal for every %s background", (_name, colors) => {
        for (const background of colors) {
            for (const seed of SEEDS.slice(0, 30)) {
                const { metal } = traitsOf({ seed, colors: [background] });
                expect(contrastRatio(metal, background), `${seed} ${background}`).toBeGreaterThanOrEqual(1.5);
            }
        }
    });

    it("never glares red", () => {
        for (const seed of SEEDS) {
            const [r, g, b] = [1, 3, 5].map((i) => parseInt(traitsOf({ seed }).glow.slice(i, i + 2), 16));
            expect(r > g + 60 && r > b + 60, seed).toBe(false);
        }
    });
});

describe("robots artwork", () => {
    it("draws the same artwork at every size", () => {
        for (const seed of SEEDS.slice(0, 20)) {
            const at = (size: number) =>
                createAvatar(robots, { seed, size }).svg.replace(/ width="\d+" height="\d+"/, "");
            expect(at(256), seed).toBe(at(32));
        }
    });

    it("is deterministic", () => {
        expect(createAvatar(robots, { seed: "bot" }).svg).toBe(createAvatar(robots, { seed: "bot" }).svg);
    });

    it("looks different across seeds", () => {
        const looks = SEEDS.slice(0, 16).map((seed) => {
            const t = traitsOf({ seed });
            return `${t.metal} ${t.headShape} ${t.antenna} ${t.eyeStyle} ${t.mouthStyle}`;
        });
        expect(new Set(looks).size).toBe(16);

        const traits = SEEDS.map((seed) => traitsOf({ seed }));
        expect(new Set(traits.map((t) => t.metal)).size).toBe(METAL_COLORS.length);
        for (const key of ["headShape", "antenna", "eyeStyle", "mouthStyle"] as const) {
            expect(new Set(traits.map((t) => t[key])).size, key).toBeGreaterThan(3);
        }
    });

    it("puts only the lights in the eyes layer, so a blink keeps the glass", () => {
        for (const eyeStyle of EYE_STYLES) {
            const { svg } = createAvatar(robots, { seed: "x", eyeStyle, animation: "blink" });
            expect(svg, eyeStyle).toContain('class="ag-layer ag-layer-eyes"');
        }
        const { svg } = createAvatar(robots, { seed: "x", eyeStyle: "screen", animation: "blink" });
        expect(svg).toContain('class="ag-layer ag-layer-faceplate"');
    });

    it.each([
        { transparent: true },
        { square: true },
        { theme: "dark" },
        { theme: "high-contrast" },
        { animation: true },
    ])("renders with %o", (option) => {
        expect(() => createAvatar(robots, { seed: "x", ...option } as RobotsOptions)).not.toThrow();
    });
});

describe("robots in a mix", () => {
    it("lends its eyes to faces and borrows faces' eyes", () => {
        const withRobotEyes = createAvatar(mixStyles(faces, { eyes: robots }), { seed: "x" });
        expect(withRobotEyes.svg).toContain("<svg");
        const withFaceEyes = createAvatar(mixStyles(robots, { eyes: faces, mouth: faces }), { seed: "x" });
        expect(withFaceEyes.svg).toContain("<svg");
    });

    it("aligns a donor's head box to its own", () => {
        expect(robots.head?.(64)).toEqual({ x: 14, y: 17, width: 36, height: 28 });
    });
});
