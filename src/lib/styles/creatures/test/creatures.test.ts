import { describe, expect, it } from "vitest";
import { contrastRatio, createAvatar, createRandom, mixStyles } from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import {
    BODY_SHAPES,
    creatures,
    EYE_COUNTS,
    HORNS,
    MARKINGS,
    MOUTH_STYLES,
    type CreaturesOptions,
} from "@avatar-generator/style-creatures";

const SEEDS = Array.from({ length: 300 }, (_, i) => `seed-${i}`);

const backgroundOf = (svg: string) => /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(svg)?.[1] as string;
const bodyOf = (svg: string) => /ag-layer-body"><[^>]* fill="([^"]+)"/.exec(svg)?.[1] as string;
const traitsOf = (options: CreaturesOptions) => creatures.prepare(options, createRandom(options.seed));

describe("validation", () => {
    it.each([
        ["bodyShape", "square"],
        ["horns", "antlers"],
        ["mouthStyle", "fangs"],
        ["markings", "stripes"],
        ["eyes", 4],
        ["eyes", "2"],
    ])("rejects %s %j", (option, value) => {
        expect(() => createAvatar(creatures, { seed: "x", [option]: value } as CreaturesOptions)).toThrow(
            /style-creatures\] Invalid/,
        );
    });

    it("rejects an empty body palette", () => {
        expect(() => createAvatar(creatures, { seed: "x", bodyColors: [] })).toThrow(/bodyColors/);
    });
});

describe("options", () => {
    const groups = {
        bodyShape: BODY_SHAPES,
        horns: HORNS,
        eyes: EYE_COUNTS,
        mouthStyle: MOUTH_STYLES,
        markings: MARKINGS,
    } as const;

    it.each(Object.entries(groups))("draws every %s differently", (option, values) => {
        const drawn = new Set(
            (values as readonly unknown[]).map(
                (value) => createAvatar(creatures, { seed: "x", [option]: value } as CreaturesOptions).svg,
            ),
        );
        expect(drawn.size).toBe(values.length);
    });

    it("keeps the eyes in one layer, so all of them blink", () => {
        for (const eyes of EYE_COUNTS) {
            const { svg } = createAvatar(creatures, { seed: "x", eyes, animation: "blink" });
            const layer = /ag-layer-eyes">(.*?)<\/g>/.exec(svg)?.[1] ?? "";
            expect(layer.match(/fill="#2B1D3A"/g)?.length, `${eyes} eyes`).toBe(eyes);
        }
    });

    it("uses a custom body palette", () => {
        const { bodyColor } = traitsOf({ seed: "x", bodyColors: ["#123ABC"] });
        expect(bodyColor).toBe("#123ABC");
    });
});

describe("colour", () => {
    it.each([
        ["default", {}],
        ["light", { theme: "light" }],
        ["dark", { theme: "dark" }],
        ["high-contrast", { theme: "high-contrast" }],
    ] as const)("keeps the body apart from a %s background", (_name, theme) => {
        for (const seed of SEEDS) {
            const { svg } = createAvatar(creatures, { seed, classes: true, ...theme });
            const body = bodyOf(svg);
            expect(contrastRatio(body, backgroundOf(svg)), `${seed} ${body}`).toBeGreaterThanOrEqual(1.5);
        }
    });

    it("keeps a creature's colour when only the background palette changes", () => {
        let kept = 0;
        for (const seed of SEEDS) {
            const plain = traitsOf({ seed }).bodyColor;
            if (traitsOf({ seed, colors: ["#14557A", "#7A1F2B"] }).bodyColor === plain) kept++;
        }
        expect(kept).toBe(SEEDS.length);
    });

    it("still draws with a one-colour palette that matches a body colour", () => {
        for (const seed of SEEDS.slice(0, 40)) {
            const { svg } = createAvatar(creatures, { seed, classes: true, colors: ["#FFD84D"] });
            expect(backgroundOf(svg)).toBe("#FFD84D");
            expect(contrastRatio(bodyOf(svg), "#FFD84D"), seed).toBeGreaterThanOrEqual(1.5);
        }
    });

    it("leaves the background out when transparent", () => {
        const { svg } = createAvatar(creatures, { seed: "x", transparent: true });
        expect(backgroundOf(svg)).toBeUndefined();
    });
});

describe("artwork", () => {
    it("draws the same artwork at every size", () => {
        const at = (size: number) =>
            createAvatar(creatures, { seed: "x", size }).svg.replace(/ width="\d+" height="\d+"/, "");
        expect(at(256)).toBe(at(32));
    });

    it("is deterministic", () => {
        expect(createAvatar(creatures, { seed: "same" }).svg).toBe(createAvatar(creatures, { seed: "same" }).svg);
    });

    it("gives 16 seeds 16 different creatures", () => {
        const seeds = SEEDS.slice(0, 16);
        expect(new Set(seeds.map((seed) => createAvatar(creatures, { seed }).svg)).size).toBe(16);
        const looks = seeds.map((seed) => {
            const t = traitsOf({ seed });
            return `${t.bodyShape} ${t.horns} ${t.eyes} ${t.mouthStyle} ${t.bodyColor}`;
        });
        expect(new Set(looks).size).toBe(16);
    });

    it("picks every trait value by itself", () => {
        const picked = SEEDS.map((seed) => traitsOf({ seed }));
        expect(new Set(picked.map((t) => t.bodyShape)).size).toBe(BODY_SHAPES.length);
        expect(new Set(picked.map((t) => t.horns)).size).toBe(HORNS.length);
        expect(new Set(picked.map((t) => t.eyes)).size).toBe(EYE_COUNTS.length);
        expect(new Set(picked.map((t) => t.mouthStyle)).size).toBe(MOUTH_STYLES.length);
        expect(new Set(picked.map((t) => t.markings)).size).toBe(MARKINGS.length);
    });

    it("lends its eyes to a face, aligned to the head", () => {
        const mixed = mixStyles(faces, { eyes: creatures });
        const { svg } = createAvatar(mixed, { seed: "x" });
        expect(svg).toMatch(/<g transform="translate\(/);
        expect(() => createAvatar(mixStyles(creatures, { mouth: faces }), { seed: "x" })).not.toThrow();
    });
});
