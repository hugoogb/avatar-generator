import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    createRandom,
    defineStyle,
    DEFAULT_COLORS,
    readableColor,
    resolveTheme,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type PortraitsHairStyle = "crop" | "side-part" | "curly" | "afro" | "long" | "bob" | "bun" | "locs" | "bald";

export type PortraitsEyeStyle = "dots" | "lidded" | "smiling" | "lashes";

export type PortraitsMouthStyle = "smile" | "grin" | "soft" | "smirk";

export interface PortraitsOptions extends AvatarOptions {
    /** Override hair style */
    hairStyle?: PortraitsHairStyle;
    /** Override eye style */
    eyeStyle?: PortraitsEyeStyle;
    /** Override mouth style */
    mouthStyle?: PortraitsMouthStyle;
    /** Force glasses on or off (default: chosen by the seed) */
    glasses?: boolean;
    /** Force facial hair on or off (default: chosen by the seed) */
    facialHair?: boolean;
    /**
     * The one colour everything is drawn in. Defaults to the theme's foreground,
     * otherwise white or near-black, whichever reads better on the background.
     */
    ink?: string;
}

/** All valid hair style values for the portraits style */
export const HAIR_STYLES: PortraitsHairStyle[] = [
    "crop",
    "side-part",
    "curly",
    "afro",
    "long",
    "bob",
    "bun",
    "locs",
    "bald",
];

/** All valid eye style values for the portraits style */
export const EYE_STYLES: PortraitsEyeStyle[] = ["dots", "lidded", "smiling", "lashes"];

/** All valid mouth style values for the portraits style */
export const MOUTH_STYLES: PortraitsMouthStyle[] = ["smile", "grin", "soft", "smirk"];

type Clothing = "crew" | "v-neck" | "collar" | "turtleneck";
type Brow = "straight" | "arched" | "soft";
type Nose = "hook" | "button" | "angle";
type Beard = "full" | "moustache" | "goatee";

const CLOTHING: Clothing[] = ["crew", "v-neck", "collar", "turtleneck"];
const BROWS: Brow[] = ["straight", "arched", "soft"];
const NOSES: Nose[] = ["hook", "button", "angle"];
const BEARDS: Beard[] = ["full", "moustache", "goatee"];

// Everything is drawn on this canvas and scaled by the SVG, so plain numbers stay
// in proportion at any size.
const CANVAS = 64;
const CX = 32;
const EYE_X = 26.6;
const EYE_Y = 29;
const LINE = 2.4;
/** Where each lens sits: nearer the middle and a little higher than the eyes. */
const LENS_X = 27.2;
const LENS_Y = 28.4;

/** An egg-shaped face, a little narrower at the jaw. */
const FACE =
    "M 32 13 C 39.6 13 44 18.4 44 26.5 C 44 35.5 38.6 44 32 44 C 25.4 44 20 35.5 20 26.5 C 20 18.4 24.4 13 32 13 Z";

/** The same outline run the other way, to punch the face out of hair drawn behind it. */
const FACE_HOLE =
    "M 32 13 C 24.4 13 20 18.4 20 26.5 C 20 35.5 25.4 44 32 44 C 38.6 44 44 35.5 44 26.5 C 44 18.4 39.6 13 32 13 Z";

const round = (value: number): number => Math.round(value * 100) / 100;

/** Reflects markup drawn for the left side onto the right. */
const mirrored = (markup: string): string => `<g transform="matrix(-1 0 0 1 ${CANVAS} 0)">${markup}</g>`;

/** Draws something on the left and its reflection on the right. */
const pair = (markup: string): string => markup + mirrored(markup);

const stroke = (d: string, ink: string, width = LINE): string =>
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const fill = (d: string, ink: string, rule = false): string =>
    `<path d="${d}" fill="${ink}"${rule ? ' fill-rule="evenodd"' : ""}/>`;

/**
 * A run of round bumps along a circle, for curls. Angles are in degrees,
 * clockwise from the right, so 180 to 360 runs over the top.
 */
function scallop(cx: number, cy: number, radius: number, from: number, to: number, bumps: number): string {
    const point = (degrees: number) => {
        const angle = (degrees * Math.PI) / 180;
        return `${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`;
    };
    const step = (to - from) / bumps;
    const bump = round(radius * Math.sin(((step / 2) * Math.PI) / 180) * 1.25);
    let d = `${point(from)}`;
    for (let i = 1; i <= bumps; i++) d += ` A ${bump} ${bump} 0 0 1 ${point(from + step * i)}`;
    return d;
}

/** What the seed decides for one portrait. */
export interface PortraitsTraits {
    /** The colour every line and mass is drawn in. */
    ink: string;
    /** The background showing through, or `undefined` when there is none. */
    paper: string | undefined;
    hairStyle: PortraitsHairStyle;
    eyeStyle: PortraitsEyeStyle;
    mouthStyle: PortraitsMouthStyle;
    glasses: boolean;
    roundGlasses: boolean;
    facialHair: boolean;
    beard: Beard;
    clothing: Clothing;
    brow: Brow;
    nose: Nose;
    /** Draws the asymmetric parts the other way round. */
    flip: boolean;
}

/** Where the fill under a line goes: the background, or nothing on a transparent avatar. */
const paperOf = (traits: PortraitsTraits): string => traits.paper ?? "none";

// ─── Hair ─────────────────────────────────────────────────────────────────

/** Hair that sits behind the head. The face is cut out, so nothing shows through it. */
function hairBehind(traits: PortraitsTraits): string {
    const { ink, paper } = traits;
    // A thin gap in the background colour keeps hair apart from the clothes below.
    const gap = paper ? ` stroke="${paper}" stroke-width="3" stroke-linejoin="round"` : "";
    // The gap is drawn first and half covered, so it falls outside the hair.
    const mass = (d: string) =>
        (paper ? `<path d="${d}" fill="none"${gap}/>` : "") +
        `<path d="${d} ${FACE_HOLE}" fill="${ink}" fill-rule="evenodd"/>`;

    switch (traits.hairStyle) {
        case "curly":
            return mass(`M 19 37 L ${scallop(32, 23, 16.2, 150, 390, 12)} L 45 37 Z`);
        case "afro":
            return mass(`M ${scallop(32, 22, 17.5, 0, 360, 14)} Z`);
        case "long":
            return mass(
                "M 32 9.6 C 42.5 9.6 47.4 16 47.4 26 L 47.6 51 C 47.6 53.4 46 54.6 44 54.6 L 41.6 54.6 C 40 54.6 39 53.2 38.8 50.4 L 38.6 43 L 25.4 43 L 25.2 50.4 C 25 53.2 24 54.6 22.4 54.6 L 20 54.6 C 18 54.6 16.4 53.4 16.4 51 L 16.6 26 C 16.6 16 21.5 9.6 32 9.6 Z",
            );
        case "bob":
            return mass(
                "M 32 10 C 42 10 47 16 47 26 L 47 40.5 C 47 43.6 45.2 45.6 42.4 45.6 L 40.4 45.6 C 39 45.6 38.4 44 38.4 41 L 25.6 41 C 25.6 44 25 45.6 23.6 45.6 L 21.6 45.6 C 18.8 45.6 17 43.6 17 40.5 L 17 26 C 17 16 22 10 32 10 Z",
            );
        case "bun":
            return `<circle cx="${CX}" cy="9" r="6"${paper ? ` fill="${ink}" stroke="${paper}" stroke-width="2"` : ` fill="${ink}"`}/>`;
        case "locs": {
            // Rounded strands falling past the shoulders, kept clear of the face.
            const strands = [
                [14, 20, 48],
                [17.4, 18, 53],
                [20.8, 36, 55.4],
            ]
                .map(
                    ([x, top, bottom]) =>
                        `<rect x="${x - 2.1}" y="${top}" width="4.2" height="${bottom - top}" rx="2.1"/>`,
                )
                .join("");
            // The gap goes round the whole bunch, not between the strands.
            const bunch = (paint: string) => pair(`<g ${paint}>${strands}</g>`);
            return (paper ? bunch(`fill="${paper}" stroke="${paper}" stroke-width="3"`) : "") + bunch(`fill="${ink}"`);
        }
        default:
            return "";
    }
}

/** Hair in front of the head: the hairline and anything framing the face. */
function hairFront(traits: PortraitsTraits): string {
    const { ink } = traits;
    switch (traits.hairStyle) {
        case "crop":
            return fill(
                "M 18.8 28 C 17.6 16 23.5 10.4 32 10.4 C 40.5 10.4 46.4 16 45.2 28 L 43.8 28 C 43.4 23.5 42 20.6 39 19.6 C 35 18.6 29 18.6 25 19.6 C 22 20.6 20.6 23.5 20.2 28 Z",
                ink,
            );
        case "side-part": {
            const hair = fill(
                "M 18.8 28 C 17.4 15 23 9.4 31 9.4 C 41 9.4 46.6 15.5 45.2 28 L 43.8 28 C 43.6 22 42.8 19.6 40.6 19 C 35 19.8 29.4 18.6 26.6 15.2 C 24.6 18.6 21.2 21.6 20.2 28 Z",
                ink,
            );
            return traits.flip ? mirrored(hair) : hair;
        }
        case "curly":
            return fill(
                `M 19 30 C 18.4 18 24 11 32 11 C 40 11 45.6 18 45 30 L 43.8 30 C 43.4 25 42.4 22.6 41.6 21.6 ${scallop(32, 1.2, 18, 58, 122, 5).replace(/^/, "L ")} C 21.6 22.6 20.6 25 20.2 30 Z`,
                ink,
            );
        case "afro":
            return fill(
                "M 19.2 26 L 19.2 10 L 44.8 10 L 44.8 26 L 43.9 26 C 43.4 20.8 39.4 17.6 32 17.6 C 24.6 17.6 20.6 20.8 20.1 26 Z",
                ink,
            );
        case "long": {
            const hair = fill(
                "M 30 14.2 C 26 15 22.4 17.6 21.4 24 C 20.6 30 21 38 21.8 47 L 18.2 47 L 18.2 26 C 18.4 15 24 10.6 32 10.6 C 40 10.6 45.6 15 45.8 26 L 45.8 47 L 42.2 47 C 43 38 43.4 30 42.6 24 C 41.6 17.6 35.4 14.2 30 14.2 Z",
                ink,
            );
            return traits.flip ? mirrored(hair) : hair;
        }
        case "bob":
            return fill(
                "M 18.8 40 L 18.6 26 C 18.6 15.5 24 11 32 11 C 40 11 45.4 15.5 45.4 26 L 45.2 40 L 43 40 C 43.4 33 43.4 27 42.6 20 Q 32 21 21.4 20 C 20.6 27 20.6 33 21 40 Z",
                ink,
            );
        case "bun":
            return fill(
                "M 19.4 28 C 19 17 24.5 11.6 32 11.6 C 39.5 11.6 45 17 44.6 28 L 43.8 28 C 43.4 22 40.6 18.4 32 18 C 23.4 18.4 20.6 22 20.2 28 Z",
                ink,
            );
        case "locs":
            return fill(
                "M 18.8 30 C 17.8 16 23.5 10.4 32 10.4 C 40.5 10.4 46.2 16 45.2 30 L 43.8 30 C 43.4 24 41.6 20.4 37.6 19.4 C 34.6 18.8 29.4 18.8 26.4 19.4 C 22.4 20.4 20.6 24 20.2 30 Z",
                ink,
            );
        case "bald":
            return "";
    }
}

// ─── Body and head ────────────────────────────────────────────────────────

function drawBody(traits: PortraitsTraits): string {
    const { ink } = traits;
    const neck = (bottom: number) =>
        stroke(`M 28.2 39 L 28.2 ${bottom}`, ink) + stroke(`M 35.8 39 L 35.8 ${bottom}`, ink);
    const shoulders = (top: number, neckline: string) =>
        `M 4 64 C 4.6 55.4 10.4 ${top + 1.6} 20.6 ${top} ${neckline} C 53.6 ${top + 1.6} 59.4 55.4 60 64 Z`;

    switch (traits.clothing) {
        case "crew":
            return neck(52) + fill(shoulders(49.4, "L 26.8 49.4 C 28 53.8 36 53.8 37.2 49.4 L 43.4 49.4"), ink);
        case "v-neck":
            return neck(55) + fill(shoulders(49.4, "L 26.6 49.4 L 32 57.4 L 37.4 49.4 L 43.4 49.4"), ink);
        case "collar":
            // A jacket open over a shirt and tie.
            return (
                neck(51) +
                fill(shoulders(49.4, "L 25.8 49.4 L 32 64 L 38.2 49.4 L 43.4 49.4"), ink) +
                fill("M 30.2 50 L 33.8 50 L 33 52.6 L 34.2 59.6 L 32 61.8 L 29.8 59.6 L 31 52.6 Z", ink)
            );
        case "turtleneck":
            return (
                `<rect x="26" y="41.4" width="12" height="7.2" rx="2.6" fill="${ink}"/>` +
                fill(shoulders(49.8, "L 43.4 49.8"), ink)
            );
    }
}

function drawHead(traits: PortraitsTraits): string {
    const { ink } = traits;
    const paper = paperOf(traits);
    const ear = `<path d="M 20.6 26.4 C 17.2 25.8 17 32.4 20.8 32.2" fill="${paper}" stroke="${ink}" stroke-width="${LINE}" stroke-linecap="round"/>`;
    return (
        pair(ear) + `<path d="${FACE}" fill="${paper}" stroke="${ink}" stroke-width="${LINE}" stroke-linejoin="round"/>`
    );
}

// ─── Features ─────────────────────────────────────────────────────────────

function drawEyes(traits: PortraitsTraits): string {
    const { ink } = traits;
    // Behind lenses, plain dots keep the glass clear: anything more reads as a mask.
    if (traits.glasses) return pair(`<circle cx="${LENS_X}" cy="${LENS_Y}" r="1.1" fill="${ink}"/>`);
    const x = EYE_X;
    const y = EYE_Y;
    switch (traits.eyeStyle) {
        case "dots":
            return pair(`<ellipse cx="${x}" cy="${y}" rx="1.9" ry="2.2" fill="${ink}"/>`);
        case "lidded":
            // An upper lid over the pupil: calm and attentive, not sleepy.
            return pair(
                stroke(`M ${x - 3.1} ${y - 0.2} Q ${x} ${y - 2.8} ${x + 3.1} ${y - 0.2}`, ink, 2.2) +
                    `<circle cx="${x}" cy="${y + 0.5}" r="1.7" fill="${ink}"/>`,
            );
        case "smiling":
            return pair(stroke(`M ${x - 3} ${y + 1} Q ${x} ${y - 2.6} ${x + 3} ${y + 1}`, ink));
        case "lashes":
            return pair(
                `<ellipse cx="${x}" cy="${y}" rx="1.9" ry="2.2" fill="${ink}"/>` +
                    stroke(`M ${x - 2.3} ${y - 1} L ${x - 3.9} ${y - 1.8}`, ink, 2.2),
            );
    }
}

function drawEyebrows(traits: PortraitsTraits): string {
    // The top of a frame stands in for the brows: both would merge into one dark band.
    if (traits.glasses) return "";
    const { ink } = traits;
    switch (traits.brow) {
        case "straight":
            return pair(stroke("M 23.8 24.4 L 29.4 23.9", ink));
        case "arched":
            return pair(stroke("M 23.8 25 Q 26.2 22.4 29.4 23.8", ink));
        case "soft":
            return pair(stroke("M 23.8 24.6 Q 27.2 23 29.6 24.2", ink));
    }
}

function drawGlasses(traits: PortraitsTraits): string {
    if (!traits.glasses) return "";
    const { ink } = traits;
    // Small lenses with background all round them, so frames, hair and the
    // face edge stay apart at any size.
    const lens = traits.roundGlasses
        ? `<circle cx="${LENS_X}" cy="${LENS_Y}" r="2.8"`
        : `<rect x="${LENS_X - 2.8}" y="${LENS_Y - 2.6}" width="5.6" height="5.2" rx="1.8"`;
    return (
        pair(`${lens} fill="none" stroke="${ink}" stroke-width="2.2"/>`) +
        stroke(`M 30.6 ${LENS_Y - 1.2} Q 32 ${LENS_Y - 2.2} 33.4 ${LENS_Y - 1.2}`, ink, 2.2)
    );
}

function drawNose(traits: PortraitsTraits): string {
    // Under glasses, a shorter nose starts below the lenses rather than between them.
    const { ink, glasses } = traits;
    let d: string;
    switch (traits.nose) {
        case "hook":
            d = glasses ? "M 32.6 32.8 C 33.4 33.6 34.2 34.2 32.2 34.8" : "M 32.6 30 C 33.6 32 34.6 33.6 32.2 34.4";
            break;
        case "button":
            d = glasses ? "M 30.4 34 Q 32 35.6 33.6 34" : "M 30.4 33.6 Q 32 35.2 33.6 33.6";
            break;
        case "angle":
            d = glasses ? "M 32 32.8 L 31.3 34.6 L 33 34.8" : "M 32 30 L 31 34 L 33 34.2";
            break;
    }
    const nose = stroke(d, ink, 2.2);
    return traits.flip ? mirrored(nose) : nose;
}

function drawFacialHair(traits: PortraitsTraits): string {
    if (!traits.facialHair) return "";
    const { ink } = traits;
    const moustache =
        "M 27 37 C 28.4 34.8 30.8 34.8 32 35.8 C 33.2 34.8 35.6 34.8 37 37 C 35.2 36.6 33.6 36.8 32 37.2 C 30.4 36.8 28.8 36.6 27 37 Z";
    switch (traits.beard) {
        case "full":
            // A beard along the jaw, open around the mouth.
            return fill(
                "M 20.4 30 C 21 38 25.4 45.6 32 45.6 C 38.6 45.6 43 38 43.6 30 C 42 34 39.6 35.4 36.6 35.2 C 35 34.8 33.4 34.8 32 35.6 C 30.6 34.8 29 34.8 27.4 35.2 C 24.4 35.4 22 34 20.4 30 Z " +
                    "M 26.6 38.6 C 26.6 41.6 29 42 32 42 C 35 42 37.4 41.6 37.4 38.6 C 35.6 37.4 28.4 37.4 26.6 38.6 Z",
                ink,
                true,
            );
        case "moustache":
            return fill(moustache, ink);
        case "goatee":
            return (
                fill(moustache, ink) + fill("M 28.4 42 Q 32 40.8 35.6 42 Q 35.2 45.8 32 46 Q 28.8 45.8 28.4 42 Z", ink)
            );
    }
}

function drawMouth(traits: PortraitsTraits): string {
    const { ink } = traits;
    switch (traits.mouthStyle) {
        case "smile":
            return stroke("M 28 38 Q 32 41.6 36 38", ink);
        case "grin":
            return `<path d="M 27.8 37.6 Q 32 38.6 36.2 37.6 Q 35.6 42.2 32 42.2 Q 28.4 42.2 27.8 37.6 Z" fill="${ink}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>`;
        case "soft":
            return stroke("M 29.2 38.6 Q 32 40.4 34.8 38.6", ink);
        case "smirk": {
            const mouth = stroke("M 28.6 39 Q 32 40.6 35.6 37.8", ink);
            return traits.flip ? mirrored(mouth) : mouth;
        }
    }
}

// ─── Traits ───────────────────────────────────────────────────────────────

/**
 * The background the avatar will get. It is drawn from its own stream, as
 * `defineStyle` does, so the ink can be chosen against it before any layer runs.
 */
function backgroundFor(options: PortraitsOptions, random: Random): string {
    return random.pick(options.colors ?? DEFAULT_COLORS);
}

function preparePortraits(options: PortraitsOptions, random: Random): PortraitsTraits {
    const background = backgroundFor(options, createRandom(`${options.seed}:background`));
    // With no background, the page behind could be any colour. The palette's
    // mid-tones hold up on both light and dark, where black or white would vanish.
    const automatic = options.transparent ? background : readableColor(background);

    return {
        ink: options.ink ?? resolveTheme(options.theme)?.foreground ?? automatic,
        paper: options.transparent ? undefined : background,
        hairStyle: options.hairStyle ?? random.pick(HAIR_STYLES),
        eyeStyle: options.eyeStyle ?? random.pick(EYE_STYLES),
        mouthStyle: options.mouthStyle ?? random.pick(MOUTH_STYLES),
        glasses: options.glasses ?? random.bool(0.25),
        roundGlasses: random.bool(0.5),
        facialHair: options.facialHair ?? random.bool(0.22),
        beard: random.pick(BEARDS),
        clothing: random.pick(CLOTHING),
        brow: random.pick(BROWS),
        nose: random.pick(NOSES),
        flip: random.bool(0.5),
    };
}

/**
 * Portraits avatar style
 *
 * Calm, single-colour head-and-shoulders portraits for business and professional
 * tools. Everything is drawn in one ink that reads on the background: hair and
 * clothing as solid masses, so a portrait still reads at 24px, and the face as
 * fine line work over the background colour.
 *
 * Its features can be mixed with other styles: `body`, `hair`, `head`, `eyes`,
 * `eyebrows`, `glasses`, `nose`, `facial-hair` and `mouth`.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { portraits } from '@avatar-generator/style-portraits';
 *
 * const avatar = createAvatar(portraits, {
 *   seed: 'unique-id',
 *   size: 64,
 *   hairStyle: 'bob',
 * });
 * ```
 */
export const portraits: ComposableStyle<PortraitsOptions, PortraitsTraits> = defineStyle<
    PortraitsOptions,
    PortraitsTraits
>({
    name: "portraits",
    canvas: CANVAS,

    validate(options) {
        validateOption("portraits", "hairStyle", options.hairStyle, HAIR_STYLES);
        validateOption("portraits", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("portraits", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
    },

    prepare: preparePortraits,

    background: backgroundFor,

    head: () => ({ x: 20, y: 13, width: 24, height: 31 }),

    layers: [
        { name: "body", render: ({ traits }) => drawBody(traits) },
        { name: "hair-behind", feature: "hair", render: ({ traits }) => hairBehind(traits) },
        { name: "head", render: ({ traits }) => drawHead(traits) },
        { name: "hair-front", feature: "hair", render: ({ traits }) => hairFront(traits) },
        { name: "eyes", render: ({ traits }) => drawEyes(traits) },
        { name: "eyebrows", render: ({ traits }) => drawEyebrows(traits) },
        { name: "glasses", render: ({ traits }) => drawGlasses(traits) },
        { name: "nose", render: ({ traits }) => drawNose(traits) },
        { name: "facial-hair", render: ({ traits }) => drawFacialHair(traits) },
        { name: "mouth", render: ({ traits }) => drawMouth(traits) },
    ],
});

export default portraits;
