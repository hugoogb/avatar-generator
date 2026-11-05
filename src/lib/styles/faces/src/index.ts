import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import { defineStyle, DEFAULT_COLORS, SKIN_TONES, validateOption } from "@avatar-generator/core";

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

/**
 * Draws the head shape — faces uses bold geometric shapes (circle, square, rounded-square)
 * instead of the ellipses used by illustrated
 */
type HairStyle = FacesHairStyle;
type EyeStyle = FacesEyeStyle;
type MouthStyle = FacesMouthStyle;

function drawHead(shape: FaceShape, cx: number, cy: number, headSize: number, color: string): string {
    const half = headSize / 2;
    switch (shape) {
        case "circle":
            return `<circle cx="${cx}" cy="${cy}" r="${half}" fill="${color}"/>`;
        case "square":
            return `<rect x="${cx - half}" y="${cy - half}" width="${headSize}" height="${headSize}" fill="${color}"/>`;
        case "rounded-square":
            return `<rect x="${cx - half}" y="${cy - half}" width="${headSize}" height="${headSize}" rx="${headSize * 0.2}" fill="${color}"/>`;
    }
}

/**
 * Draws hair — uses flat geometric blocks instead of bezier curves
 */
function drawHair(style: HairStyle, cx: number, cy: number, headSize: number, color: string): string {
    const half = headSize / 2;
    const top = cy - half;
    const left = cx - half;
    const right = cx + half;

    switch (style) {
        case "none":
            return "";
        case "flat-top":
            // Flat rectangular block on top
            return `<rect x="${left - 2}" y="${top - 6}" width="${headSize + 4}" height="${headSize * 0.25 + 6}" fill="${color}"/>`;
        case "cap":
            // Semi-circle cap on top
            return `<path d="M ${left - 3} ${cy - half * 0.3} A ${half + 3} ${half + 3} 0 0 1 ${right + 3} ${cy - half * 0.3} L ${right + 3} ${top + 2} L ${left - 3} ${top + 2} Z" fill="${color}"/>`;
        case "side-swept":
            // Angular block shifted to one side
            return `<polygon points="${left - 4},${top + 4} ${left - 4},${top - 8} ${cx + half * 0.3},${top - 8} ${right},${top + 4}" fill="${color}"/>`;
        case "spiky":
            // Triangle spikes on top
            return (
                `<polygon points="${left},${top + 2} ${left + headSize * 0.15},${top - 10} ${left + headSize * 0.3},${top + 2}" fill="${color}"/>` +
                `<polygon points="${cx - headSize * 0.15},${top + 2} ${cx},${top - 14} ${cx + headSize * 0.15},${top + 2}" fill="${color}"/>` +
                `<polygon points="${right - headSize * 0.3},${top + 2} ${right - headSize * 0.15},${top - 10} ${right},${top + 2}" fill="${color}"/>`
            );
        case "round-top":
            // Large semicircle sitting on top of head
            return `<circle cx="${cx}" cy="${top}" r="${half * 0.7}" fill="${color}"/>`;
        case "mohawk":
            // Tall narrow rectangle on top center
            return `<rect x="${cx - 4}" y="${top - 14}" width="8" height="${headSize * 0.3 + 14}" rx="2" fill="${color}"/>`;
        case "beanie":
            // Rectangle with rounded top covering upper portion
            return (
                `<rect x="${left - 3}" y="${top - 4}" width="${headSize + 6}" height="${headSize * 0.35 + 4}" rx="${headSize * 0.15}" fill="${color}"/>` +
                `<rect x="${left - 4}" y="${top + headSize * 0.2}" width="${headSize + 8}" height="4" rx="2" fill="${color}" opacity="0.7"/>`
            );
    }
}

/**
 * Draws eyes — uses simple geometric shapes (dots, rectangles, lines)
 * distinct from illustrated's detailed eye whites + iris + highlights
 */
function drawEyes(style: EyeStyle, cx: number, eyeY: number, spacing: number, color: string): string {
    const lx = cx - spacing;
    const rx = cx + spacing;

    switch (style) {
        case "dots":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="2.5" fill="${color}"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="2.5" fill="${color}"/>`
            );
        case "rectangles":
            return (
                `<rect x="${lx - 3}" y="${eyeY - 2}" width="6" height="4" fill="${color}"/>` +
                `<rect x="${rx - 3}" y="${eyeY - 2}" width="6" height="4" fill="${color}"/>`
            );
        case "lines":
            return (
                `<line x1="${lx - 3}" y1="${eyeY}" x2="${lx + 3}" y2="${eyeY}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>` +
                `<line x1="${rx - 3}" y1="${eyeY}" x2="${rx + 3}" y2="${eyeY}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`
            );
        case "round":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white" stroke="${color}" stroke-width="1.5"/>` +
                `<circle cx="${lx}" cy="${eyeY}" r="1.5" fill="${color}"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white" stroke="${color}" stroke-width="1.5"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="1.5" fill="${color}"/>`
            );
    }
}

/**
 * Draws mouth — uses flat geometric shapes instead of bezier curves
 */
function drawMouth(style: MouthStyle, cx: number, mouthY: number, color: string): string {
    switch (style) {
        case "line":
            return `<line x1="${cx - 5}" y1="${mouthY}" x2="${cx + 5}" y2="${mouthY}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
        case "rect-smile":
            // U-shaped smile using rect with only bottom half visible
            return (
                `<rect x="${cx - 5}" y="${mouthY - 1}" width="10" height="6" rx="3" fill="none" stroke="${color}" stroke-width="1.5"/>` +
                `<rect x="${cx - 5}" y="${mouthY - 2}" width="10" height="3" fill="currentBackground" opacity="0"/>`
            );
        case "open-rect":
            return `<rect x="${cx - 4}" y="${mouthY - 2}" width="8" height="5" rx="1" fill="${color}"/>`;
        case "zigzag":
            return `<polyline points="${cx - 5},${mouthY} ${cx - 2},${mouthY + 3} ${cx + 2},${mouthY} ${cx + 5},${mouthY + 3}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        case "dot":
            return `<circle cx="${cx}" cy="${mouthY + 1}" r="2.5" fill="${color}"/>`;
    }
}

/** What the seed decides for one faces avatar. */
export interface FacesTraits {
    skinColor: string;
    hairColor: string;
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

/**
 * The order of these draws is part of the output: reordering them changes every
 * avatar for every seed.
 */
function prepareFaces(options: FacesOptions, random: Random): FacesTraits {
    const skinTones = options.skinTones ?? SKIN_TONES;
    const colors = options.colors ?? DEFAULT_COLORS;

    return {
        skinColor: random.pick(skinTones),
        hairColor: random.pick(colors),
        featureColor: options.featureColor ?? "#2C1810",
        // Face shape — unique to this style
        faceShape: random.pick(FACE_SHAPES),
        hairStyle: options.hairStyle ?? random.pick(HAIR_STYLES),
        eyeStyle: options.eyeStyle ?? random.pick(EYE_STYLES),
        mouthStyle: options.mouthStyle ?? random.pick(MOUTH_STYLES),
        showEyebrows: options.eyebrows !== false && random.bool(0.5),
        showEars: options.ears !== false && random.bool(0.4),
        showNose: options.nose !== false && random.bool(0.3),
        showBlush: random.bool(0.25),
    };
}

// Geometry — faces uses a single headSize (square proportions) instead of elliptical
const headSizeOf = (size: number) => size * 0.6;
const eyeYOf = (size: number) => size / 2 - headSizeOf(size) * 0.1;
const eyeSpacingOf = (size: number) => headSizeOf(size) * 0.22;

/**
 * Faces avatar style
 *
 * Creates bold, geometric, icon-style face avatars with varied head shapes
 * (circle, square, rounded-square), flat hair blocks, and simple geometric features.
 * Visually distinct from the illustrated style which uses detailed bezier curves.
 *
 * Its features can be mixed with other styles: `hair`, `ears`, `head`, `eyes`,
 * `eyebrows`, `nose`, `mouth` and `blush`.
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

    validate(options) {
        validateOption("faces", "hairStyle", options.hairStyle, HAIR_STYLES);
        validateOption("faces", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("faces", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
    },

    prepare: prepareFaces,

    head: (size) => ({ x: size * 0.2, y: size * 0.2, width: size * 0.6, height: size * 0.6 }),

    layers: [
        {
            // Only some styles extend behind the head.
            name: "hair-behind",
            feature: "hair",
            render: ({ traits, cx, cy, size }) =>
                traits.hairStyle === "round-top"
                    ? drawHair(traits.hairStyle, cx, cy, headSizeOf(size), traits.hairColor)
                    : "",
        },
        {
            name: "ears",
            render: ({ traits, cx, cy, size }) => {
                if (!traits.showEars) return "";
                const earR = size * 0.06;
                const half = headSizeOf(size) / 2;
                return (
                    `<circle cx="${cx - half - earR * 0.5}" cy="${cy}" r="${earR}" fill="${traits.skinColor}"/>` +
                    `<circle cx="${cx + half + earR * 0.5}" cy="${cy}" r="${earR}" fill="${traits.skinColor}"/>`
                );
            },
        },
        {
            name: "head",
            render: ({ traits, cx, cy, size }) =>
                drawHead(traits.faceShape, cx, cy, headSizeOf(size), traits.skinColor),
        },
        {
            name: "hair-front",
            feature: "hair",
            render: ({ traits, cx, cy, size }) =>
                traits.hairStyle !== "round-top"
                    ? drawHair(traits.hairStyle, cx, cy, headSizeOf(size), traits.hairColor)
                    : "",
        },
        {
            name: "eyes",
            render: ({ traits, cx, size }) =>
                drawEyes(traits.eyeStyle, cx, eyeYOf(size), eyeSpacingOf(size), traits.featureColor),
        },
        {
            // Simple straight lines
            name: "eyebrows",
            render: ({ traits, cx, size }) => {
                if (!traits.showEyebrows) return "";
                const browY = eyeYOf(size) - 6;
                const lx = cx - eyeSpacingOf(size);
                const rx = cx + eyeSpacingOf(size);
                const color = traits.featureColor;
                return (
                    `<line x1="${lx - 3}" y1="${browY}" x2="${lx + 3}" y2="${browY}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>` +
                    `<line x1="${rx - 3}" y1="${browY}" x2="${rx + 3}" y2="${browY}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`
                );
            },
        },
        {
            name: "nose",
            render: ({ traits, cx, cy, size }) => {
                if (!traits.showNose) return "";
                const noseY = cy + headSizeOf(size) * 0.04;
                return `<line x1="${cx}" y1="${noseY - 2}" x2="${cx}" y2="${noseY + 2}" stroke="${traits.featureColor}" stroke-width="1.5" stroke-linecap="round"/>`;
            },
        },
        {
            name: "mouth",
            render: ({ traits, cx, cy, size }) =>
                drawMouth(traits.mouthStyle, cx, cy + headSizeOf(size) * 0.2, traits.featureColor),
        },
        {
            name: "blush",
            render: ({ traits, cx, cy, size }) => {
                if (!traits.showBlush) return "";
                const blushY = cy + headSizeOf(size) * 0.08;
                const spacing = eyeSpacingOf(size);
                return (
                    `<circle cx="${cx - spacing - 2}" cy="${blushY}" r="3" fill="#FF6B6B" opacity="0.3"/>` +
                    `<circle cx="${cx + spacing + 2}" cy="${blushY}" r="3" fill="#FF6B6B" opacity="0.3"/>`
                );
            },
        },
    ],
});

export default faces;
