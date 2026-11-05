import { describe, expect, it } from "vitest";
import {
    contrastRatio,
    createAvatar,
    createRandom,
    DEFAULT_COLORS,
    readableColor,
    SKIN_TONES,
} from "@avatar-generator/core";
import { abstract } from "@avatar-generator/style-abstract";
import { animals } from "@avatar-generator/style-animals";
import { anime } from "@avatar-generator/style-anime";
import { emoji } from "@avatar-generator/style-emoji";
import { faces } from "@avatar-generator/style-faces";
import { geometric } from "@avatar-generator/style-geometric";
import { gradient } from "@avatar-generator/style-gradient";
import { illustrated } from "@avatar-generator/style-illustrated";
import { initials } from "@avatar-generator/style-initials";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";

const SEEDS = Array.from({ length: 300 }, (_, i) => `seed-${i}`);

const backgroundOf = (svg: string) => /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(svg)?.[1] as string;

describe("colour", () => {
    it("keeps text readable at 4.5:1 on the whole default palette", () => {
        for (const color of DEFAULT_COLORS) {
            expect(contrastRatio(color, readableColor(color)), color).toBeGreaterThanOrEqual(4.5);
        }
    });

    it("draws initials in the readable colour", () => {
        for (const seed of SEEDS) {
            const { svg } = createAvatar(initials, { seed });
            const text = /<text[^>]* fill="([^"]+)"/.exec(svg)?.[1] as string;
            expect(contrastRatio(text, backgroundOf(svg)), seed).toBeGreaterThanOrEqual(4.5);
        }
    });

    it("keeps the geometric pattern distinct from its background", () => {
        for (const seed of SEEDS) {
            const { svg } = createAvatar(geometric, { seed });
            const cell = /crispEdges"><rect[^>]* fill="([^"]+)"/.exec(svg)?.[1] as string;
            expect(contrastRatio(cell, backgroundOf(svg)), seed).toBeGreaterThanOrEqual(3);
        }
    });

    it.each([
        ["initials", initials, /<text[^>]* fill="([^"]+)"/],
        ["geometric", geometric, /crispEdges"><rect[^>]* fill="([^"]+)"/],
    ])("does not assume a page colour for a transparent %s", (_name, style, pattern) => {
        for (const seed of SEEDS.slice(0, 40)) {
            const { svg } = createAvatar(style as typeof initials, { seed, transparent: true });
            expect(DEFAULT_COLORS).toContain(pattern.exec(svg)?.[1]);
        }
    });

    it("keeps an animal apart from its background", () => {
        const coats = { fox: "#D96E2E", frog: "#6FB368", panda: "#FFFFFF" };
        for (const [animal, coat] of Object.entries(coats)) {
            for (const seed of SEEDS.slice(0, 60)) {
                const { svg } = createAvatar(animals, { seed, animal: animal as keyof typeof coats });
                expect(contrastRatio(coat, backgroundOf(svg)), seed).toBeGreaterThanOrEqual(1.5);
            }
        }
    });
});

describe("hair", () => {
    it("stands apart from the skin in every tone", () => {
        for (const skin of SKIN_TONES) {
            for (const seed of SEEDS.slice(0, 60)) {
                const { hairColor } = faces.prepare({ seed, skinTones: [skin] }, createRandom(seed));
                expect(contrastRatio(hairColor, skin), `${seed} ${skin}`).toBeGreaterThanOrEqual(1.6);
            }
        }
    });
});

// A profile picture should not look upset by accident.
describe("default expressions", () => {
    const traits = <T>(style: { prepare(options: { seed: string }, random: ReturnType<typeof createRandom>): T }) =>
        SEEDS.map((seed) => style.prepare({ seed }, createRandom(seed)));

    it("faces never picks the zigzag mouth by itself", () => {
        expect(traits(faces).map((t) => t.mouthStyle)).not.toContain("zigzag");
    });

    it("illustrated never picks a frown, furrowed brows, a unibrow or sleepy eyes by itself", () => {
        const picked = traits(illustrated);
        expect(picked.map((t) => t.mouthStyle)).not.toContain("frown");
        expect(picked.map((t) => t.eyeStyle)).not.toContain("sleepy");
        expect(picked.map((t) => t.eyebrowStyle)).not.toContain("furrowed");
        expect(picked.map((t) => t.eyebrowStyle)).not.toContain("unibrow");
    });

    it("anime never picks a pout, furrowed brows or half-closed eyes by itself", () => {
        const picked = traits(anime);
        expect(picked.map((t) => t.mouthStyle)).not.toContain("pout");
        expect(picked.map((t) => t.eyeStyle)).not.toContain("half-closed");
        expect(picked.map((t) => t.eyebrowStyle)).not.toContain("furrowed");
    });

    it("still draws each of them when asked for", () => {
        const plain = createAvatar(illustrated, { seed: "x", mouthStyle: "smile" }).svg;
        expect(createAvatar(illustrated, { seed: "x", mouthStyle: "frown" }).svg).not.toBe(plain);
        expect(() => createAvatar(faces, { seed: "x", mouthStyle: "zigzag" })).not.toThrow();
        expect(() => createAvatar(anime, { seed: "x", eyeStyle: "half-closed", mouthStyle: "pout" })).not.toThrow();
    });
});

describe("hair coverage", () => {
    it("keeps illustrated's see-through buzz cut inside the head", () => {
        // An arc with the head's own radii, so nothing can spill past its edge.
        const { svg } = createAvatar(illustrated, { seed: "x", hairStyle: "buzz", hat: false });
        const head = /<ellipse[^>]* rx="([\d.]+)" ry="([\d.]+)" fill="[^"]+"\/>/g;
        const radii = [...svg.matchAll(head)].map((match) => `${match[1]} ${match[2]}`);
        const arc = /A ([\d.]+ [\d.]+) 0 0 1 [^"]*" fill="[^"]+" opacity="0.6"/.exec(svg)?.[1];
        expect(radii).toContain(arc);
    });

    it("gives faces hair that follows a square head", () => {
        for (const hairStyle of ["cap", "side-swept", "spiky", "beanie", "flat-top", "round-top"] as const) {
            for (const seed of SEEDS.slice(0, 40)) {
                const { faceShape } = faces.prepare({ seed }, createRandom(seed));
                if (faceShape === "circle") continue;
                const { svg } = createAvatar(faces, { seed, hairStyle });
                expect(svg, `${seed} ${hairStyle}`).toMatch(/<path d="M 15\.5 \d+ V [\d.]+ Q 15\.5 11/);
            }
        }
    });
});

describe("independence", () => {
    // Background and skin once took the first draw from identical generators, so
    // each background colour only ever appeared with one skin tone.
    it.each([
        ["faces", faces],
        ["illustrated", illustrated],
        ["anime", anime],
        ["pixels", pixels],
    ])("%s does not tie skin tone to background colour", (_name, style) => {
        const skins = new Map<string, Set<string>>();
        for (const seed of SEEDS) {
            const { svg } = createAvatar(style as typeof faces, { seed });
            const background = backgroundOf(svg);
            const skin = SKIN_TONES.find((tone) => svg.includes(tone)) as string;
            skins.set(background, (skins.get(background) ?? new Set()).add(skin));
        }
        for (const [background, seen] of skins) {
            expect(seen.size, background).toBeGreaterThanOrEqual(3);
        }
    });
});

describe("scaling", () => {
    it.each([
        ["faces", faces],
        ["illustrated", illustrated],
        ["anime", anime],
        ["emoji", emoji],
        ["animals", animals],
        ["rings", rings],
        ["abstract", abstract],
        ["gradient", gradient],
    ])("%s draws the same artwork at every size", (_name, style) => {
        const at = (size: number) =>
            createAvatar(style as typeof faces, { seed: "x", size }).svg.replace(/ width="\d+" height="\d+"/, "");
        expect(at(256)).toBe(at(32));
    });

    it("keeps a border's width in real pixels on a scaled canvas", () => {
        const stroke = (size: number) =>
            /stroke-width="([\d.]+)"\/><\/svg>/.exec(
                createAvatar(faces, { seed: "x", size, border: { width: 2, color: "#000" } }).svg,
            )?.[1];
        expect(Number(stroke(64))).toBeCloseTo(2);
        expect(Number(stroke(128))).toBeCloseTo(1);
    });
});

describe("artwork defects", () => {
    it("uses only valid paint values", () => {
        for (const mouthStyle of ["line", "rect-smile", "open-rect", "zigzag", "dot"] as const) {
            expect(createAvatar(faces, { seed: "x", mouthStyle }).svg).not.toContain("currentBackground");
        }
    });

    it("gives pixels visibly different eyes", () => {
        const eyes = new Set(
            SEEDS.map((seed) => {
                const { svg } = createAvatar(pixels, { seed, animation: "blink", accessories: false });
                return /ag-layer-eyes">(.*?)<\/g>/.exec(svg)?.[1];
            }),
        );
        expect(eyes.size).toBeGreaterThanOrEqual(4);
    });

    it("lines Mondrian's dividers up with its blocks", () => {
        let checked = 0;
        for (const seed of SEEDS.slice(0, 80)) {
            const { svg } = createAvatar(abstract, { seed, composition: "mondrian", colors: ["#AAAAAA", "#BBBBBB"] });
            const blocks = [
                ...svg.matchAll(/<rect x="\d+" y="(\d+)" width="\d+" height="\d+" fill="#(?:AAAAAA|BBBBBB)"/g),
            ];
            const tops = new Set(blocks.map((match) => Number(match[1])));
            for (const line of svg.matchAll(/<rect x="\d+" y="([\d.]+)" width="\d+" height="2.5" fill="#111111"/g)) {
                expect(tops, seed).toContain(Number(line[1]) + 1.25);
                checked++;
            }
        }
        expect(checked).toBeGreaterThan(0);
    });

    it("works out initials from an email's local part", () => {
        expect(createAvatar(initials, { seed: "ana.li@example.com" }).svg).toContain(">AL</text>");
        expect(createAvatar(initials, { seed: "ana@example.com" }).svg).toContain(">A</text>");
    });

    it.each([
        ["abstract", abstract],
        ["rings", rings],
        ["gradient", gradient],
        ["geometric", geometric],
        ["animals", animals],
        ["emoji", emoji],
    ])("%s renders with a one-colour palette", (_name, style) => {
        expect(() => createAvatar(style as typeof faces, { seed: "x", colors: ["#123456"] })).not.toThrow();
    });
});
