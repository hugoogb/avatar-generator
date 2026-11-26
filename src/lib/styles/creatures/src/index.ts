import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    contrastRatio,
    createRandom,
    DEFAULT_COLORS,
    defineStyle,
    pickContrasting,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

/** The outline of a creature's body, which doubles as its head. */
export type CreaturesBodyShape = "round" | "tall" | "pear" | "wobbly";

/** What grows on top of a creature. */
export type CreaturesHorns = "none" | "nubs" | "curly" | "antennae";

/** How many eyes a creature has. */
export type CreaturesEyes = 1 | 2 | 3;

/** A creature's mouth. Every one of them is friendly. */
export type CreaturesMouthStyle = "smile" | "tooth" | "open" | "tongue";

/** Patterns on a creature's body. */
export type CreaturesMarkings = "none" | "spots" | "belly";

export interface CreaturesOptions extends AvatarOptions {
    /** Override the body shape */
    bodyShape?: CreaturesBodyShape;
    /** Override what grows on top */
    horns?: CreaturesHorns;
    /** Override the number of eyes */
    eyes?: CreaturesEyes;
    /** Override the mouth */
    mouthStyle?: CreaturesMouthStyle;
    /** Override the body markings */
    markings?: CreaturesMarkings;
    /** Custom body colour palette (default: bright made-up colours) */
    bodyColors?: string[];
}

/** All valid body shape values for the creatures style */
export const BODY_SHAPES: CreaturesBodyShape[] = ["round", "tall", "pear", "wobbly"];

/** All valid horn values for the creatures style */
export const HORNS: CreaturesHorns[] = ["none", "nubs", "curly", "antennae"];

/** All valid eye counts for the creatures style */
export const EYE_COUNTS: CreaturesEyes[] = [1, 2, 3];

/** All valid mouth style values for the creatures style */
export const MOUTH_STYLES: CreaturesMouthStyle[] = ["smile", "tooth", "open", "tongue"];

/** All valid marking values for the creatures style */
export const MARKINGS: CreaturesMarkings[] = ["none", "spots", "belly"];

/** Bright colours no real animal wears, so a creature never reads as a species. */
export const BODY_COLORS = [
    "#8BE06B", // Lime
    "#FF8FB1", // Bubblegum
    "#FFD84D", // Lemon
    "#6EE7D2", // Mint
    "#B79CFF", // Lilac
    "#FF9F5A", // Tangerine
    "#3FB6FF", // Sky
    "#FF6B6B", // Coral
    "#6C9BFF", // Periwinkle
    "#E77BFF", // Orchid
];

// Everything is drawn on this canvas and scaled by the SVG.
const CANVAS = 64;
const CX = 32;
const EYE_Y = 30;
const MOUTH_Y = 40;

const INK = "#2B1D3A";
const WHITE = "#FFFFFF";
const BONE = "#FFF1D2";
/** Horns on a body too pale for bone to show. */
const TAN = "#C08552";
const TONGUE = "#FF5C8A";
const BULBS = ["#FFE066", "#FF7AA8", "#7CE0FF", "#FFFFFF"];

/** The body must stand this far apart from the background. */
const BODY_CONTRAST = 1.5;

// ─── Body ────────────────────────────────────────────────────────────────

/** Where the top of each body sits 9 units either side of centre, for the horns. */
const CROWN: Record<CreaturesBodyShape, number> = { round: 19, tall: 18, pear: 19, wobbly: 16 };

function drawBody(shape: CreaturesBodyShape, color: string): string {
    switch (shape) {
        case "round":
            // A ball on two stubby feet.
            return (
                `<ellipse cx="24" cy="57" rx="5.5" ry="4" fill="${color}"/>` +
                `<ellipse cx="40" cy="57" rx="5.5" ry="4" fill="${color}"/>` +
                `<circle cx="${CX}" cy="37" r="21" fill="${color}"/>`
            );
        case "tall":
            return `<path d="M 16 66 V 29 C 16 9 48 9 48 29 V 66 Z" fill="${color}"/>`;
        case "pear":
            return `<path d="M 6 66 C 6 52 12 46 16 38 C 14 22 21 14 32 14 C 43 14 50 22 48 38 C 52 46 58 52 58 66 Z" fill="${color}"/>`;
        case "wobbly":
            return (
                `<path d="M 12 66 C 6 58 14 52 10 45 C 6 37 11 29 16 26 C 13 18 22 12 27 15 C 29 10 35 10 37 15 ` +
                `C 42 12 51 18 48 26 C 53 29 58 37 54 45 C 50 52 58 58 52 66 Z" fill="${color}"/>`
            );
    }
}

// ─── Horns ───────────────────────────────────────────────────────────────

function drawHorns(horns: CreaturesHorns, shape: CreaturesBodyShape, body: string, bulb: string): string {
    const base = CROWN[shape];
    const horn = contrastRatio(BONE, body) >= 1.25 ? BONE : TAN;
    switch (horns) {
        case "none":
            return "";
        case "nubs":
            // Stubby and rounded, leaning out: pointed ones read as a cat's ears.
            return [-1, 1]
                .map((side) => {
                    const x = CX + side * 9;
                    return `<rect x="${x - 3.5}" y="${base - 9}" width="7" height="14" rx="3.5" fill="${horn}" transform="rotate(${side * 20} ${x} ${base + 4})"/>`;
                })
                .join("");
        case "curly":
            return [-1, 1]
                .map((side) => {
                    const x = CX + side * 8;
                    const d =
                        `M ${x} ${base + 3} C ${x} ${base - 6} ${x + side * 6} ${base - 11} ${x + side * 11} ${base - 9} ` +
                        `C ${x + side * 15} ${base - 7} ${x + side * 14} ${base - 1} ${x + side * 10} ${base - 2}`;
                    return `<path d="${d}" fill="none" stroke="${horn}" stroke-width="4.6" stroke-linecap="round"/>`;
                })
                .join("");
        case "antennae":
            return [-1, 1]
                .map((side) => {
                    const x = CX + side * 5;
                    const tipX = CX + side * 11;
                    return (
                        `<path d="M ${x} ${base + 2} Q ${x + side} ${base - 8} ${tipX} ${base - 11}" fill="none" stroke="${body}" stroke-width="2.6" stroke-linecap="round"/>` +
                        `<circle cx="${tipX}" cy="${base - 11}" r="3.6" fill="${bulb}"/>`
                    );
                })
                .join("");
    }
}

// ─── Markings ────────────────────────────────────────────────────────────

/** Spots stay clear of the face and inside the body; the ball has a set of its own. */
const SPOTS_ROUND: [number, number, number][] = [
    [21, 46, 3],
    [42, 50, 3.6],
    [31, 53, 2.2],
    [25, 21, 1.9],
    [46, 46, 2],
    [38, 19.5, 1.6],
];

const SPOTS: [number, number, number][] = [
    [22, 52, 3.2],
    [41, 56, 3.8],
    [31, 61, 2.4],
    [25, 20, 1.9],
    [42, 49, 2.2],
    [38, 19, 1.6],
];

/** A lighter patch, or a deeper one on a body too pale for white to show. */
function patch(body: string): string {
    return contrastRatio(body, WHITE) < 1.7 ? `fill="#000" fill-opacity="0.1"` : `fill="#fff" fill-opacity="0.38"`;
}

function drawMarkings(markings: CreaturesMarkings, shape: CreaturesBodyShape, body: string, pick: number): string {
    switch (markings) {
        case "none":
            return "";
        case "spots": {
            const spots = shape === "round" ? SPOTS_ROUND : SPOTS;
            const chosen = spots.filter((_, index) => (pick >> index) % 2 === 0 || index < 2);
            return chosen.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${patch(body)}/>`).join("");
        }
        case "belly": {
            const fill = patch(body);
            return shape === "round"
                ? `<ellipse cx="${CX}" cy="51" rx="11" ry="6.5" ${fill}/>`
                : `<ellipse cx="${CX}" cy="62" rx="13" ry="13" ${fill}/>`;
        }
    }
}

// ─── Eyes ────────────────────────────────────────────────────────────────

function eye(x: number, y: number, r: number, lookX: number, lookY: number): string {
    const pupil = r * 0.55;
    const px = x + lookX * r * 0.22;
    const py = y + lookY * r * 0.18;
    return (
        `<circle cx="${x}" cy="${y}" r="${r + 1.4}" fill="#000" fill-opacity="0.16"/>` +
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${WHITE}"/>` +
        `<circle cx="${px}" cy="${py}" r="${pupil}" fill="${INK}"/>` +
        `<circle cx="${px + pupil * 0.35}" cy="${py - pupil * 0.4}" r="${Math.max(pupil * 0.32, 0.9)}" fill="${WHITE}"/>`
    );
}

function drawEyes(count: CreaturesEyes, lookX: number, lookY: number): string {
    switch (count) {
        case 1:
            return eye(CX, EYE_Y, 7.4, lookX, lookY);
        case 2:
            return eye(CX - 8, EYE_Y, 4.9, lookX, lookY) + eye(CX + 8, EYE_Y, 4.9, lookX, lookY);
        case 3:
            // Kept nearly level, so a blink folds them along one line.
            return (
                eye(CX - 9.5, EYE_Y + 1, 4, lookX, lookY) +
                eye(CX, EYE_Y - 2, 4.4, lookX, lookY) +
                eye(CX + 9.5, EYE_Y + 1, 4, lookX, lookY)
            );
    }
}

// ─── Mouth ───────────────────────────────────────────────────────────────

function drawMouth(style: CreaturesMouthStyle): string {
    const y = MOUTH_Y;
    const smile = `<path d="M ${CX - 7} ${y} Q ${CX} ${y + 6.5} ${CX + 7} ${y}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    switch (style) {
        case "smile":
            return smile;
        case "tooth":
            // One small tooth, off centre: goofy rather than fierce.
            return (
                `<path d="M ${CX - 8} ${y - 1} Q ${CX} ${y + 1} ${CX + 8} ${y - 1} Q ${CX + 7} ${y + 6} ${CX} ${y + 6} Q ${CX - 7} ${y + 6} ${CX - 8} ${y - 1} Z" fill="${INK}"/>` +
                `<path d="M ${CX - 4.5} ${y - 0.2} H ${CX - 0.5} V ${y + 2.2} Q ${CX - 2.5} ${y + 3.6} ${CX - 4.5} ${y + 2.2} Z" fill="${WHITE}"/>`
            );
        case "open":
            return (
                `<path d="M ${CX - 6.5} ${y - 1} H ${CX + 6.5} Q ${CX + 6.5} ${y + 8} ${CX} ${y + 8} Q ${CX - 6.5} ${y + 8} ${CX - 6.5} ${y - 1} Z" fill="${INK}"/>` +
                `<path d="M ${CX - 4} ${y + 6.2} Q ${CX} ${y + 2.6} ${CX + 4} ${y + 6.2} Q ${CX} ${y + 8.4} ${CX - 4} ${y + 6.2} Z" fill="${TONGUE}"/>`
            );
        case "tongue":
            return (
                `<path d="M ${CX + 0.5} ${y + 2.6} V ${y + 6} A 2.9 2.9 0 0 0 ${CX + 6.3} ${y + 6} V ${y + 1.6}" fill="${TONGUE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
                smile
            );
    }
}

// ─── Traits ──────────────────────────────────────────────────────────────

/** What the seed decides for one creature. */
export interface CreaturesTraits {
    bodyShape: CreaturesBodyShape;
    horns: CreaturesHorns;
    eyes: CreaturesEyes;
    mouthStyle: CreaturesMouthStyle;
    markings: CreaturesMarkings;
    bodyColor: string;
    bulbColor: string;
    lookX: number;
    lookY: number;
    spotPattern: number;
    blush: boolean;
}

/**
 * The body colour. A pure function of the options, because the background is
 * picked to stand apart from it in a stream of its own.
 */
function pickBodyColor(options: CreaturesOptions): string {
    const palette = options.bodyColors ?? BODY_COLORS;
    const backgrounds = options.colors ?? DEFAULT_COLORS;
    // A colour no background stands apart from would fade into all of them.
    const usable = palette.filter((color) =>
        backgrounds.some((background) => contrastRatio(color, background) >= BODY_CONTRAST),
    );
    const random = createRandom(`${options.seed}:body`);
    const first = random.pick(palette);
    // Re-picked only when it must be, so a creature keeps its colour across themes.
    return usable.length === 0 || usable.includes(first) ? first : random.pick(usable);
}

/** Hue in degrees, or `undefined` for a grey or a colour that is not hex. */
function hue(color: string): number | undefined {
    const match = /^#([0-9a-f]{6})$/i.exec(color);
    if (!match) return undefined;
    const [r, g, b] = [0, 2, 4].map((start) => parseInt(match[1].slice(start, start + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (delta < 0.15) return undefined;
    const sector = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return (sector * 60 + 360) % 360;
}

function sameFamily(a: string, b: string): boolean {
    const first = hue(a);
    const second = hue(b);
    if (first === undefined || second === undefined) return false;
    const distance = Math.abs(first - second);
    return Math.min(distance, 360 - distance) < 40;
}

/**
 * A background that stands apart from the body, preferably in another hue as
 * well: a lilac creature on indigo passes on contrast but blends at a glance.
 */
function pickBackground(colors: string[], body: string, random: Random): string {
    const apart = colors.filter((color) => contrastRatio(color, body) >= BODY_CONTRAST && !sameFamily(color, body));
    return apart.length > 0 ? random.pick(apart) : pickContrasting(random, colors, body, BODY_CONTRAST);
}

function prepareCreatures(options: CreaturesOptions, random: Random): CreaturesTraits {
    const bodyColor = pickBodyColor(options);
    return {
        bodyShape: options.bodyShape ?? random.pick(BODY_SHAPES),
        horns: options.horns ?? random.pick(HORNS),
        // Two eyes most often, so the odd ones stay a surprise.
        eyes: options.eyes ?? random.pick<CreaturesEyes>([1, 2, 2, 3]),
        mouthStyle: options.mouthStyle ?? random.pick(MOUTH_STYLES),
        markings: options.markings ?? random.pick(MARKINGS),
        bodyColor,
        bulbColor: pickContrasting(random, BULBS, bodyColor, 1.4),
        lookX: random.pick([-1, 0, 0, 1]),
        lookY: random.pick([0, 0, 1]),
        spotPattern: random.int(0, 16),
        blush: random.bool(0.45),
    };
}

/**
 * Creatures avatar style
 *
 * Friendly made-up monsters for games, kids' products and communities: a
 * bright body in one of four shapes, with horns, nubs or antennae, one to
 * three eyes, a grin and sometimes spots or a pale belly. No real species, so
 * it reads apart from the animals style. The body stays distinct from the
 * background on any palette that allows it.
 *
 * Its features can be mixed with other styles: `horns`, `body`, `markings`,
 * `eyes`, `blush` and `mouth`. The body doubles as the head.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { creatures } from '@avatar-generator/style-creatures';
 *
 * const avatar = createAvatar(creatures, { seed: 'user-42', eyes: 3 });
 * ```
 */
export const creatures: ComposableStyle<CreaturesOptions, CreaturesTraits> = defineStyle<
    CreaturesOptions,
    CreaturesTraits
>({
    name: "creatures",
    canvas: CANVAS,

    validate(options) {
        validateOption("creatures", "bodyShape", options.bodyShape, BODY_SHAPES);
        validateOption("creatures", "horns", options.horns, HORNS);
        validateOption("creatures", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
        validateOption("creatures", "markings", options.markings, MARKINGS);
        if (options.eyes !== undefined && !EYE_COUNTS.includes(options.eyes)) {
            throw new Error(
                `[@avatar-generator/style-creatures] Invalid eyes: ${JSON.stringify(options.eyes)}. ` +
                    `Expected one of: 1, 2, 3.`,
            );
        }
        if (options.bodyColors !== undefined && options.bodyColors.length === 0) {
            throw new Error(`[@avatar-generator/style-creatures] bodyColors needs at least one colour.`);
        }
    },

    prepare: prepareCreatures,

    background: (options, random) => pickBackground(options.colors ?? DEFAULT_COLORS, pickBodyColor(options), random),

    head: () => ({ x: 17, y: 16, width: 30, height: 30 }),

    layers: [
        {
            name: "horns",
            render: ({ traits }) => drawHorns(traits.horns, traits.bodyShape, traits.bodyColor, traits.bulbColor),
        },
        { name: "body", render: ({ traits }) => drawBody(traits.bodyShape, traits.bodyColor) },
        {
            name: "markings",
            render: ({ traits }) =>
                drawMarkings(traits.markings, traits.bodyShape, traits.bodyColor, traits.spotPattern),
        },
        { name: "eyes", render: ({ traits }) => drawEyes(traits.eyes, traits.lookX, traits.lookY) },
        {
            name: "blush",
            render: ({ traits }) =>
                traits.blush
                    ? `<ellipse cx="${CX - 13}" cy="${MOUTH_Y - 1}" rx="3.2" ry="2.2" fill="#FF4F7B" fill-opacity="0.35"/>` +
                      `<ellipse cx="${CX + 13}" cy="${MOUTH_Y - 1}" rx="3.2" ry="2.2" fill="#FF4F7B" fill-opacity="0.35"/>`
                    : "",
        },
        { name: "mouth", render: ({ traits }) => drawMouth(traits.mouthStyle) },
    ],
});

export default creatures;
