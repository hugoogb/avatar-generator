import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    contrastRatio,
    defineStyle,
    HAIR_COLORS,
    pickContrasting,
    SKIN_TONES,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type FacesHairStyle = "none" | "flat-top" | "cap" | "side-swept" | "spiky" | "round-top" | "mohawk" | "beanie";

export type FacesEyeStyle = "dots" | "rectangles" | "lines" | "round";

export type FacesMouthStyle = "line" | "rect-smile" | "open-rect" | "zigzag" | "dot";

export interface FacesOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Override feature color (eyes, mouth, eyebrows) */
    featureColor?: string;
    /** Enable eyebrows (default: true) */
    eyebrows?: boolean;
    /** Enable ears (default: true) */
    ears?: boolean;
    /** Enable nose (default: true) */
    nose?: boolean;
    /** Override mouth style */
    mouthStyle?: FacesMouthStyle;
    /** Override eye style */
    eyeStyle?: FacesEyeStyle;
    /** Override hair style */
    hairStyle?: FacesHairStyle;
}

// ─── Illustrated style option unions ──────────────────────────────────────

/**
 * Face shape types — faces uses distinct geometric shapes for the head
 */
type FaceShape = "circle" | "square" | "rounded-square";

const FACE_SHAPES: FaceShape[] = ["circle", "square", "rounded-square"];

/** All valid hair style values for the faces style */
export const HAIR_STYLES: FacesHairStyle[] = [
    "none",
    "flat-top",
    "cap",
    "side-swept",
    "spiky",
    "round-top",
    "mohawk",
    "beanie",
];

/** All valid eye style values for the faces style */
export const EYE_STYLES: FacesEyeStyle[] = ["dots", "rectangles", "lines", "round"];

/** All valid mouth style values for the faces style */
export const MOUTH_STYLES: FacesMouthStyle[] = ["line", "rect-smile", "open-rect", "zigzag", "dot"];

type HairStyle = FacesHairStyle;
type EyeStyle = FacesEyeStyle;
type MouthStyle = FacesMouthStyle;

// Everything is drawn on this canvas and scaled by the SVG, so plain numbers stay
// in proportion at any size.
const CANVAS = 64;
const CX = 32;
const CY = 28;
const HEAD = 30;
const HALF = HEAD / 2;
const TOP = CY - HALF;
const LEFT = CX - HALF;
const RIGHT = CX + HALF;
const EYE_Y = CY - 1;
const EYE_SPACING = 6.4;
const MOUTH_Y = CY + 7;

/** A profile picture should not look upset by accident, so this needs asking for. */
const FRIENDLY_MOUTHS = MOUTH_STYLES.filter((style) => style !== "zigzag");

const SHIRTS = ["#1F2937", "#F3F4F6", "#374151", "#FFFFFF", "#111827"];

function drawHead(shape: FaceShape, color: string): string {
    switch (shape) {
        case "circle":
            return `<circle cx="${CX}" cy="${CY}" r="${HALF}" fill="${color}"/>`;
        case "square":
            return `<rect x="${LEFT}" y="${TOP}" width="${HEAD}" height="${HEAD}" rx="3" fill="${color}"/>`;
        case "rounded-square":
            return `<rect x="${LEFT}" y="${TOP}" width="${HEAD}" height="${HEAD}" rx="8" fill="${color}"/>`;
    }
}

/**
 * Hair over the crown, following the head's own shape. A round dome would leave
 * the top corners of a square head showing.
 */
function crown(shape: FaceShape, depth: number, color: string): string {
    const y = TOP + depth;
    if (shape === "circle") {
        return `<path d="M ${LEFT - 1.5} ${y} C ${LEFT - 1.5} ${TOP - 6} ${RIGHT + 1.5} ${TOP - 6} ${RIGHT + 1.5} ${y} Z" fill="${color}"/>`;
    }
    const radius = shape === "square" ? 4 : 9;
    return (
        `<path d="M ${LEFT - 1.5} ${y} V ${TOP - 2 + radius} Q ${LEFT - 1.5} ${TOP - 2} ${LEFT - 1.5 + radius} ${TOP - 2} ` +
        `H ${RIGHT + 1.5 - radius} Q ${RIGHT + 1.5} ${TOP - 2} ${RIGHT + 1.5} ${TOP - 2 + radius} V ${y} Z" fill="${color}"/>`
    );
}

/**
 * Draws the hair in front of the head — flat geometric blocks that sit on it
 */
function drawHair(style: HairStyle, shape: FaceShape, color: string): string {
    switch (style) {
        case "none":
            return "";
        case "flat-top":
            return (
                crown(shape, 7, color) +
                `<rect x="${LEFT - 1.5}" y="${TOP - 4.5}" width="${HEAD + 3}" height="7" rx="2.5" fill="${color}"/>`
            );
        case "cap":
            return crown(shape, 8, color);
        case "side-swept":
            return (
                crown(shape, 6, color) +
                `<path d="M ${LEFT - 1.5} ${TOP + 11} V ${TOP + 3} H ${CX + 8} C ${CX + 2} ${TOP + 7} ${CX - 5} ${TOP + 7} ${LEFT - 1.5} ${TOP + 11} Z" fill="${color}"/>`
            );
        case "spiky":
            return (
                crown(shape, 6, color) +
                `<path d="M ${LEFT + 1} ${TOP + 1} L ${LEFT + 5} ${TOP - 6} L ${CX - 4} ${TOP} L ${CX + 1} ${TOP - 8} L ${CX + 5} ${TOP} L ${RIGHT - 4} ${TOP - 6} L ${RIGHT - 1} ${TOP + 1} Z" fill="${color}"/>`
            );
        case "round-top":
            // The mass behind the head shows around it, and this covers the crown.
            return crown(shape, 6, color);
        case "mohawk":
            return `<rect x="${CX - 3.5}" y="${TOP - 7}" width="7" height="14" rx="3.5" fill="${color}"/>`;
        case "beanie":
            return (
                crown(shape, 7, color) +
                `<rect x="${LEFT - 2.5}" y="${TOP + 4}" width="${HEAD + 5}" height="5" rx="2.5" fill="${color}"/>` +
                `<rect x="${LEFT - 2.5}" y="${TOP + 4}" width="${HEAD + 5}" height="5" rx="2.5" fill="#fff" fill-opacity="0.22"/>`
            );
    }
}

/**
 * Draws eyes — simple geometric shapes, large enough to survive a 24px avatar
 */
function drawEyes(style: EyeStyle, color: string): string {
    const lx = CX - EYE_SPACING;
    const rx = CX + EYE_SPACING;

    switch (style) {
        case "dots":
            return `<circle cx="${lx}" cy="${EYE_Y}" r="2.4" fill="${color}"/><circle cx="${rx}" cy="${EYE_Y}" r="2.4" fill="${color}"/>`;
        case "rectangles":
            return (
                `<rect x="${lx - 2.8}" y="${EYE_Y - 1.8}" width="5.6" height="3.6" rx="1" fill="${color}"/>` +
                `<rect x="${rx - 2.8}" y="${EYE_Y - 1.8}" width="5.6" height="3.6" rx="1" fill="${color}"/>`
            );
        case "lines":
            return (
                `<path d="M ${lx - 3} ${EYE_Y + 1} Q ${lx} ${EYE_Y - 2} ${lx + 3} ${EYE_Y + 1}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>` +
                `<path d="M ${rx - 3} ${EYE_Y + 1} Q ${rx} ${EYE_Y - 2} ${rx + 3} ${EYE_Y + 1}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`
            );
        case "round":
            return (
                `<circle cx="${lx}" cy="${EYE_Y}" r="3.6" fill="#fff"/><circle cx="${lx}" cy="${EYE_Y}" r="2" fill="${color}"/>` +
                `<circle cx="${rx}" cy="${EYE_Y}" r="3.6" fill="#fff"/><circle cx="${rx}" cy="${EYE_Y}" r="2" fill="${color}"/>`
            );
    }
}

/**
 * Draws mouth — flat geometric shapes
 */
function drawMouth(style: MouthStyle, color: string): string {
    switch (style) {
        case "line":
            return `<line x1="${CX - 4.5}" y1="${MOUTH_Y}" x2="${CX + 4.5}" y2="${MOUTH_Y}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
        case "rect-smile":
            return `<path d="M ${CX - 5} ${MOUTH_Y - 1} Q ${CX} ${MOUTH_Y + 5} ${CX + 5} ${MOUTH_Y - 1}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
        case "open-rect":
            return `<path d="M ${CX - 5} ${MOUTH_Y - 1.5} H ${CX + 5} Q ${CX + 5} ${MOUTH_Y + 4.5} ${CX} ${MOUTH_Y + 4.5} Q ${CX - 5} ${MOUTH_Y + 4.5} ${CX - 5} ${MOUTH_Y - 1.5} Z" fill="${color}"/>`;
        case "zigzag":
            // A soft wave, as sharp corners read as a grimace.
            return `<path d="M ${CX - 5} ${MOUTH_Y + 0.5} Q ${CX - 2.5} ${MOUTH_Y + 2.5} ${CX} ${MOUTH_Y + 0.5} Q ${CX + 2.5} ${MOUTH_Y - 1.5} ${CX + 5} ${MOUTH_Y + 0.5}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
        case "dot":
            return `<circle cx="${CX}" cy="${MOUTH_Y + 0.5}" r="2.2" fill="${color}"/>`;
    }
}

/** What the seed decides for one faces avatar. */
export interface FacesTraits {
    skinColor: string;
    hairColor: string;
    shirtColor: string;
    featureColor: string;
    faceShape: FaceShape;
    hairStyle: HairStyle;
    eyeStyle: EyeStyle;
    mouthStyle: MouthStyle;
    showEyebrows: boolean;
    showEars: boolean;
    showNose: boolean;
    showBlush: boolean;
}

function prepareFaces(options: FacesOptions, random: Random): FacesTraits {
    const skinColor = random.pick(options.skinTones ?? SKIN_TONES);
    const defaultFeature = contrastRatio(skinColor, "#2C1810") >= 3 ? "#2C1810" : "#120A06";

    return {
        skinColor,
        // Apart from the skin, or a short cut would read as a bald head.
        hairColor: pickContrasting(random, HAIR_COLORS, skinColor, 1.6),
        shirtColor: random.pick(SHIRTS),
        featureColor: options.featureColor ?? defaultFeature,
        // Face shape — unique to this style
        faceShape: random.pick(FACE_SHAPES),
        hairStyle: options.hairStyle ?? random.pick(HAIR_STYLES),
        eyeStyle: options.eyeStyle ?? random.pick(EYE_STYLES),
        mouthStyle: options.mouthStyle ?? random.pick(FRIENDLY_MOUTHS),
        showEyebrows: options.eyebrows !== false && random.bool(0.5),
        showEars: options.ears !== false && random.bool(0.6),
        showNose: options.nose !== false && random.bool(0.3),
        showBlush: random.bool(0.25),
    };
}

/**
 * Faces avatar style
 *
 * Creates bold, geometric, icon-style head-and-shoulders avatars with varied head
 * shapes (circle, square, rounded-square), flat hair blocks, and simple geometric
 * features that stay legible down to 24px.
 *
 * Its features can be mixed with other styles: `body`, `hair`, `ears`, `head`,
 * `eyes`, `eyebrows`, `nose`, `mouth` and `blush`.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { faces } from '@avatar-generator/style-faces';
 *
 * const avatar = createAvatar(faces, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const faces: ComposableStyle<FacesOptions, FacesTraits> = defineStyle<FacesOptions, FacesTraits>({
    name: "faces",
    canvas: CANVAS,

    validate(options) {
        validateOption("faces", "hairStyle", options.hairStyle, HAIR_STYLES);
        validateOption("faces", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("faces", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
    },

    prepare: prepareFaces,

    head: () => ({ x: LEFT, y: TOP, width: HEAD, height: HEAD }),

    layers: [
        {
            name: "body",
            render: ({ traits }) =>
                `<path d="M 10 64 C 10 50 20 46 ${CX} 46 C 44 46 54 50 54 64 Z" fill="${traits.shirtColor}"/>` +
                `<rect x="${CX - 4.5}" y="${CY + HALF - 3}" width="9" height="9" rx="2" fill="${traits.skinColor}"/>`,
        },
        {
            // Only one hair style extends behind the head.
            name: "hair-behind",
            feature: "hair",
            render: ({ traits }) =>
                traits.hairStyle === "round-top"
                    ? `<circle cx="${CX}" cy="${TOP + 8}" r="${HALF + 4}" fill="${traits.hairColor}"/>`
                    : "",
        },
        {
            name: "ears",
            render: ({ traits }) =>
                traits.showEars
                    ? `<circle cx="${LEFT - 1}" cy="${CY + 1}" r="3.4" fill="${traits.skinColor}"/>` +
                      `<circle cx="${RIGHT + 1}" cy="${CY + 1}" r="3.4" fill="${traits.skinColor}"/>`
                    : "",
        },
        { name: "head", render: ({ traits }) => drawHead(traits.faceShape, traits.skinColor) },
        {
            name: "hair-front",
            feature: "hair",
            render: ({ traits }) => drawHair(traits.hairStyle, traits.faceShape, traits.hairColor),
        },
        { name: "eyes", render: ({ traits }) => drawEyes(traits.eyeStyle, traits.featureColor) },
        {
            // Simple straight lines
            name: "eyebrows",
            render: ({ traits }) => {
                if (!traits.showEyebrows) return "";
                const y = EYE_Y - 5.2;
                const stroke = `stroke="${traits.featureColor}" stroke-width="1.8" stroke-linecap="round"`;
                return (
                    `<line x1="${CX - EYE_SPACING - 3}" y1="${y}" x2="${CX - EYE_SPACING + 3}" y2="${y}" ${stroke}/>` +
                    `<line x1="${CX + EYE_SPACING - 3}" y1="${y}" x2="${CX + EYE_SPACING + 3}" y2="${y}" ${stroke}/>`
                );
            },
        },
        {
            name: "nose",
            render: ({ traits }) =>
                traits.showNose
                    ? `<line x1="${CX}" y1="${CY + 1}" x2="${CX}" y2="${CY + 3.6}" stroke="${traits.featureColor}" stroke-width="1.6" stroke-linecap="round"/>`
                    : "",
        },
        { name: "mouth", render: ({ traits }) => drawMouth(traits.mouthStyle, traits.featureColor) },
        {
            name: "blush",
            render: ({ traits }) =>
                traits.showBlush
                    ? `<circle cx="${CX - EYE_SPACING - 3}" cy="${CY + 4}" r="2.8" fill="#FF6B6B" opacity="0.35"/>` +
                      `<circle cx="${CX + EYE_SPACING + 3}" cy="${CY + 4}" r="2.8" fill="#FF6B6B" opacity="0.35"/>`
                    : "",
        },
    ],
});

export default faces;
