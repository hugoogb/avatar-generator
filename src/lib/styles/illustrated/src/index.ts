import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    contrastRatio,
    defineStyle,
    DEFAULT_COLORS,
    EYE_COLORS,
    HAIR_COLORS,
    pickContrasting,
    SKIN_TONES,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type IllustratedHairStyle =
    | "bald"
    | "buzz"
    | "short"
    | "medium"
    | "long"
    | "curly"
    | "wavy"
    | "mohawk"
    | "afro"
    | "ponytail"
    | "bangs"
    | "sidepart";

export type IllustratedEyeStyle = "round" | "almond" | "narrow" | "wide" | "sleepy" | "winking" | "looking" | "glasses";

export type IllustratedEyebrowStyle = "natural" | "thick" | "thin" | "raised" | "furrowed" | "unibrow";

export type IllustratedNoseStyle = "small" | "pointed" | "round" | "long" | "button";

export type IllustratedMouthStyle = "smile" | "bigSmile" | "neutral" | "frown" | "open" | "smirk" | "tongue" | "teeth";

export interface IllustratedOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Override hair style */
    hairStyle?: IllustratedHairStyle;
    /** Override eye style */
    eyeStyle?: IllustratedEyeStyle;
    /** Override eyebrow style */
    eyebrowStyle?: IllustratedEyebrowStyle;
    /** Override nose style */
    noseStyle?: IllustratedNoseStyle;
    /** Override mouth style */
    mouthStyle?: IllustratedMouthStyle;
    /** Enable glasses (default: true, 20% chance) */
    glasses?: boolean;
    /** Enable hat (default: true, 10% chance) */
    hat?: boolean;
    /** Enable earrings (default: true, 8% chance) */
    earrings?: boolean;
    /** Enable facial hair (default: true, 15% chance) */
    facialHair?: boolean;
    /** Custom eye color palette */
    eyeColors?: string[];
}

// ─── Anime style option unions ────────────────────────────────────────────

// ============================================================================
// Feature variant types
// ============================================================================

type HairStyle = IllustratedHairStyle;
type EyeStyle = IllustratedEyeStyle;
type EyebrowStyle = IllustratedEyebrowStyle;
type NoseStyle = IllustratedNoseStyle;
type MouthStyle = IllustratedMouthStyle;
type GlassesType = "round" | "square" | "aviator";
type HatType = "beanie" | "cap" | "tophat";
type FacialHairType = "stubble" | "mustache" | "beard";

/** All valid hair style values for the illustrated style */
export const HAIR_STYLES: HairStyle[] = [
    "bald",
    "buzz",
    "short",
    "medium",
    "long",
    "curly",
    "wavy",
    "mohawk",
    "afro",
    "ponytail",
    "bangs",
    "sidepart",
];

/** All valid eye style values for the illustrated style */
export const EYE_STYLES: EyeStyle[] = ["round", "almond", "narrow", "wide", "sleepy", "winking", "looking", "glasses"];

/** All valid eyebrow style values for the illustrated style */
export const EYEBROW_STYLES: EyebrowStyle[] = ["natural", "thick", "thin", "raised", "furrowed", "unibrow"];

/** All valid nose style values for the illustrated style */
export const NOSE_STYLES: NoseStyle[] = ["small", "pointed", "round", "long", "button"];

/** All valid mouth style values for the illustrated style */
export const MOUTH_STYLES: MouthStyle[] = ["smile", "bigSmile", "neutral", "frown", "open", "smirk", "tongue", "teeth"];
// A profile picture should not look upset by accident, so these need asking for.
const FRIENDLY_EYEBROWS = EYEBROW_STYLES.filter((style) => style !== "furrowed" && style !== "unibrow");
const FRIENDLY_EYES = EYE_STYLES.filter((style) => style !== "sleepy");
const FRIENDLY_MOUTHS = MOUTH_STYLES.filter((style) => style !== "frown");
const GLASSES_TYPES: GlassesType[] = ["round", "square", "aviator"];
const HAT_TYPES: HatType[] = ["beanie", "cap", "tophat"];
const FACIAL_HAIR_TYPES: FacialHairType[] = ["stubble", "mustache", "beard"];

// ============================================================================
// Geometry helper
// ============================================================================

interface Geo {
    size: number;
    cx: number;
    cy: number;
    headW: number;
    headH: number;
    eyeY: number;
    eyeSpacing: number;
    mouthY: number;
    noseY: number;
    browY: number;
}

/** Drawn in this coordinate space and scaled, so details stay in proportion. */
const CANVAS = 64;
const SHIRTS = ["#1F2937", "#F3F4F6", "#374151", "#7C3AED", "#0F766E", "#B91C1C"];

function computeGeo(size: number): Geo {
    const cx = size / 2;
    const cy = size * 0.42;
    const headW = size * 0.47;
    const headH = size * 0.55;
    return {
        size,
        cx,
        cy,
        headW,
        headH,
        eyeY: cy - headH * 0.04,
        eyeSpacing: headW * 0.2,
        mouthY: cy + headH * 0.22,
        noseY: cy + headH * 0.08,
        browY: cy - headH * 0.2,
    };
}

// ============================================================================
// Hair rendering
// ============================================================================

/** The hair over the crown, which frames the face and meets the hair behind it. */
function crown(g: Geo, color: string, hairline: number): string {
    const { cx, cy, headW, headH } = g;
    const top = cy - headH / 2;
    const left = cx - headW / 2;
    const right = cx + headW / 2;
    return `<path d="M ${left - 0.8} ${cy - 2} C ${left - 1.5} ${top - 7} ${right + 1.5} ${top - 7} ${right + 0.8} ${cy - 2} C ${right - 2} ${top + hairline} ${left + 2} ${top + hairline} ${left - 0.8} ${cy - 2} Z" fill="${color}"/>`;
}

function drawHairBehind(style: HairStyle, g: Geo, color: string): string {
    const { cx, cy, headW, headH } = g;
    const top = cy - headH / 2;
    const left = cx - headW / 2;
    const right = cx + headW / 2;

    switch (style) {
        case "bald":
        case "buzz":
        case "short":
        case "sidepart":
        case "bangs":
            return "";
        case "medium":
            return `<path d="M ${left - 3} ${cy + 10} C ${left - 5} ${top - 6} ${right + 5} ${top - 6} ${right + 3} ${cy + 10} Q ${cx} ${cy + 14} ${left - 3} ${cy + 10} Z" fill="${color}"/>`;
        case "long":
            return `<path d="M ${left - 4} ${cy + 24} C ${left - 7} ${top - 6} ${right + 7} ${top - 6} ${right + 4} ${cy + 24} Q ${cx} ${cy + 28} ${left - 4} ${cy + 24} Z" fill="${color}"/>`;
        case "curly": {
            let curls = "";
            for (let i = 0; i <= 8; i++) {
                const angle = Math.PI * (1 + i / 8);
                const x = cx + Math.cos(angle) * (headW / 2 + 1.5);
                const y = cy - 3 + Math.sin(angle) * (headH / 2 + 0.5);
                curls += `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
            }
            return curls;
        }
        case "wavy":
            return `<path d="M ${left - 3} ${cy + 14} Q ${left - 7} ${cy + 6} ${left - 4} ${cy} C ${left - 6} ${top - 6} ${right + 6} ${top - 6} ${right + 4} ${cy} Q ${right + 7} ${cy + 6} ${right + 3} ${cy + 14} Q ${cx} ${cy + 18} ${left - 3} ${cy + 14} Z" fill="${color}"/>`;
        case "mohawk":
            return "";
        case "afro":
            return `<circle cx="${cx}" cy="${top + 10}" r="${headW / 2 + 9}" fill="${color}"/>`;
        case "ponytail":
            return `<path d="M ${right - 2} ${top + 8} C ${right + 10} ${top + 4} ${right + 11} ${cy + 16} ${right + 4} ${cy + 22} C ${right + 5} ${cy + 12} ${right + 2} ${cy + 4} ${right - 3} ${cy} Z" fill="${color}"/>`;
    }
}

function drawHairFront(style: HairStyle, g: Geo, color: string): string {
    const { cx, cy, headW, headH } = g;
    const top = cy - headH / 2;
    const left = cx - headW / 2;
    const right = cx + headW / 2;

    switch (style) {
        case "bald":
            return "";
        case "buzz":
            // Follows the head exactly, so the see-through hair cannot spill past it.
            return `<path d="M ${left} ${cy - 3} A ${headW / 2} ${headH / 2} 0 0 1 ${right} ${cy - 3} C ${right - 2} ${top + 6} ${left + 2} ${top + 6} ${left} ${cy - 3} Z" fill="${color}" opacity="0.6"/>`;
        case "short":
        case "medium":
        case "long":
        case "wavy":
        case "ponytail":
            return crown(g, color, 6);
        case "curly":
        case "afro":
            return crown(g, color, 5);
        case "mohawk":
            return `<rect x="${cx - 3.5}" y="${top - 7}" width="7" height="16" rx="3.5" fill="${color}"/>`;
        case "bangs":
            return `<path d="M ${left - 1} ${cy - 1} C ${left - 2} ${top - 7} ${right + 2} ${top - 7} ${right + 1} ${cy - 1} L ${right - 2} ${cy - 5} Q ${cx} ${cy - 8} ${left + 2} ${cy - 5} Z" fill="${color}"/>`;
        case "sidepart":
            return `<path d="M ${left - 1} ${cy - 1} C ${left - 2} ${top - 7} ${right + 2} ${top - 7} ${right + 1} ${cy - 1} C ${right - 1} ${top + 8} ${cx + 4} ${top + 5} ${cx - 5} ${top + 4} C ${left + 3} ${top + 8} ${left + 2} ${cy - 5} ${left - 1} ${cy - 1} Z" fill="${color}"/>`;
    }
}

// ============================================================================
// Eyes rendering
// ============================================================================

function drawEyes(style: EyeStyle, g: Geo, featureColor: string, eyeColor: string): string {
    const { cx, eyeY, eyeSpacing } = g;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;

    switch (style) {
        case "round":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/><circle cx="${lx + 0.5}" cy="${eyeY - 0.5}" r="0.8" fill="white"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2" fill="${eyeColor}"/><circle cx="${rx + 0.5}" cy="${eyeY - 0.5}" r="0.8" fill="white"/>`
            );
        case "almond":
            return (
                `<ellipse cx="${lx}" cy="${eyeY}" rx="4" ry="2.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="1.8" fill="${eyeColor}"/>` +
                `<ellipse cx="${rx}" cy="${eyeY}" rx="4" ry="2.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="1.8" fill="${eyeColor}"/>`
            );
        case "narrow":
            return (
                `<ellipse cx="${lx}" cy="${eyeY}" rx="4" ry="1.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="1.2" fill="${eyeColor}"/>` +
                `<ellipse cx="${rx}" cy="${eyeY}" rx="4" ry="1.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="1.2" fill="${eyeColor}"/>`
            );
        case "wide":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="4.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2.5" fill="${eyeColor}"/><circle cx="${lx + 0.8}" cy="${eyeY - 1}" r="1" fill="white"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="4.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2.5" fill="${eyeColor}"/><circle cx="${rx + 0.8}" cy="${eyeY - 1}" r="1" fill="white"/>`
            );
        case "sleepy": {
            // A half-open eye: the lid is a straight line across the top of it.
            const lid = eyeY - 1.2;
            const half = (x: number) =>
                `<path d="M ${x - 3.6} ${lid} H ${x + 3.6} A 3.6 3.8 0 0 1 ${x - 3.6} ${lid} Z" fill="white"/>` +
                `<path d="M ${x - 2.3} ${lid} H ${x + 2.3} A 2.3 2.8 0 0 1 ${x - 2.3} ${lid} Z" fill="${eyeColor}"/>` +
                `<line x1="${x - 3.8}" y1="${lid}" x2="${x + 3.8}" y2="${lid}" stroke="${featureColor}" stroke-width="1.1" stroke-linecap="round"/>`;
            return half(lx) + half(rx);
        }
        case "winking":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>` +
                `<path d="M ${rx - 3} ${eyeY} Q ${rx} ${eyeY - 3} ${rx + 3} ${eyeY}" fill="none" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`
            );
        case "looking":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx + 1}" cy="${eyeY}" r="2" fill="${eyeColor}"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx + 1}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`
            );
        case "glasses":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`
            );
    }
}

// ============================================================================
// Eyebrows rendering
// ============================================================================

function drawEyebrows(style: EyebrowStyle, g: Geo, color: string): string {
    const { cx, browY, eyeSpacing } = g;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;
    const stroke = (width: number) =>
        `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
    /** One brow, from its outer end to its inner end, with `lift` at the arch. */
    const pair = (lift: number, inner: number, outer: number, width: number) =>
        `<path d="M ${lx - 3.2} ${browY + outer} Q ${lx} ${browY - lift} ${lx + 3.2} ${browY + inner}" ${stroke(width)}/>` +
        `<path d="M ${rx + 3.2} ${browY + outer} Q ${rx} ${browY - lift} ${rx - 3.2} ${browY + inner}" ${stroke(width)}/>`;

    switch (style) {
        case "natural":
            return pair(0.8, 0.3, 0.6, 1.3);
        case "thick":
            return pair(0.8, 0.3, 0.6, 2);
        case "thin":
            return pair(0.6, 0.2, 0.4, 0.8);
        case "raised":
            return pair(2, 0, 0.3, 1.3);
        case "furrowed":
            return pair(0.2, 1, -0.3, 1.5);
        case "unibrow":
            return `<path d="M ${lx - 3.2} ${browY + 0.6} Q ${lx} ${browY - 0.8} ${cx} ${browY + 0.2} Q ${rx} ${browY - 0.8} ${rx + 3.2} ${browY + 0.6}" ${stroke(1.5)}/>`;
    }
}

// ============================================================================
// Nose rendering
// ============================================================================

// Soft on purpose: a nose in the same dark line as the eyes reads as a mask.
function drawNose(style: NoseStyle, g: Geo, color: string): string {
    const { cx, noseY } = g;
    const stroke = `fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"`;

    switch (style) {
        case "small":
            return `<path d="M ${cx - 1.6} ${noseY + 0.6} Q ${cx} ${noseY + 1.8} ${cx + 1.6} ${noseY + 0.6}" ${stroke}/>`;
        case "pointed":
            return `<path d="M ${cx - 0.2} ${noseY - 2.5} L ${cx + 1.6} ${noseY + 1.2} L ${cx - 0.8} ${noseY + 1.2}" ${stroke}/>`;
        case "round":
            return `<ellipse cx="${cx}" cy="${noseY + 0.4}" rx="2.4" ry="1.7" fill="${color}" opacity="0.18"/>`;
        case "long":
            return `<path d="M ${cx - 0.4} ${noseY - 3.5} Q ${cx + 1.8} ${noseY} ${cx - 0.6} ${noseY + 1.4}" ${stroke}/>`;
        case "button":
            return `<path d="M ${cx - 2} ${noseY} Q ${cx} ${noseY + 2.6} ${cx + 2} ${noseY}" ${stroke}/>`;
    }
}

// ============================================================================
// Mouth rendering
// ============================================================================

function drawMouth(style: MouthStyle, g: Geo, color: string): string {
    const { cx, mouthY } = g;

    switch (style) {
        case "smile":
            return `<path d="M ${cx - 6} ${mouthY} Q ${cx} ${mouthY + 7} ${cx + 6} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
        case "bigSmile":
            return (
                `<path d="M ${cx - 8} ${mouthY} Q ${cx} ${mouthY + 10} ${cx + 8} ${mouthY}" fill="#fff" stroke="${color}" stroke-width="1.5"/>` +
                `<path d="M ${cx - 5} ${mouthY + 5} Q ${cx} ${mouthY + 8} ${cx + 5} ${mouthY + 5}" fill="#FF6B6B" opacity="0.5"/>`
            );
        case "neutral":
            return `<line x1="${cx - 5}" y1="${mouthY + 2}" x2="${cx + 5}" y2="${mouthY + 2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
        case "frown":
            return `<path d="M ${cx - 3.5} ${mouthY + 3} Q ${cx} ${mouthY + 1} ${cx + 3.5} ${mouthY + 3}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
        case "open":
            return `<ellipse cx="${cx}" cy="${mouthY + 2.4}" rx="3.2" ry="2.6" fill="#4a2020"/><ellipse cx="${cx}" cy="${mouthY + 3.6}" rx="2" ry="1.2" fill="#FF6B6B" opacity="0.6"/>`;
        case "smirk":
            return `<path d="M ${cx - 4} ${mouthY + 2} Q ${cx + 2} ${mouthY + 5} ${cx + 6} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
        case "tongue":
            return (
                `<path d="M ${cx - 5} ${mouthY} Q ${cx} ${mouthY + 6} ${cx + 5} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>` +
                `<ellipse cx="${cx}" cy="${mouthY + 5}" rx="3" ry="2.5" fill="#FF6B6B"/>`
            );
        case "teeth":
            return `<path d="M ${cx - 6} ${mouthY} Q ${cx} ${mouthY + 7} ${cx + 6} ${mouthY}" fill="#fff" stroke="${color}" stroke-width="1.5"/>`;
    }
}

// ============================================================================
// Accessories rendering
// ============================================================================

function drawGlasses(type: GlassesType, g: Geo, color: string): string {
    const { cx, eyeY, eyeSpacing } = g;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;
    const bridge = `<line x1="${lx + 5}" y1="${eyeY - 1}" x2="${rx - 5}" y2="${eyeY - 1}" stroke="${color}" stroke-width="1"/>`;

    switch (type) {
        case "round":
            return (
                `<circle cx="${lx}" cy="${eyeY}" r="5.5" fill="none" stroke="${color}" stroke-width="1.5"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="5.5" fill="none" stroke="${color}" stroke-width="1.5"/>` +
                bridge
            );
        case "square":
            return (
                `<rect x="${lx - 5}" y="${eyeY - 4}" width="10" height="8" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>` +
                `<rect x="${rx - 5}" y="${eyeY - 4}" width="10" height="8" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>` +
                bridge
            );
        case "aviator":
            return (
                `<path d="M ${lx - 6} ${eyeY - 3} Q ${lx - 6} ${eyeY + 5} ${lx} ${eyeY + 5} Q ${lx + 6} ${eyeY + 5} ${lx + 6} ${eyeY - 3} Q ${lx + 6} ${eyeY - 5} ${lx} ${eyeY - 5} Q ${lx - 6} ${eyeY - 5} ${lx - 6} ${eyeY - 3} Z" fill="none" stroke="${color}" stroke-width="1.2"/>` +
                `<path d="M ${rx - 6} ${eyeY - 3} Q ${rx - 6} ${eyeY + 5} ${rx} ${eyeY + 5} Q ${rx + 6} ${eyeY + 5} ${rx + 6} ${eyeY - 3} Q ${rx + 6} ${eyeY - 5} ${rx} ${eyeY - 5} Q ${rx - 6} ${eyeY - 5} ${rx - 6} ${eyeY - 3} Z" fill="none" stroke="${color}" stroke-width="1.2"/>` +
                bridge
            );
    }
}

function drawHat(type: HatType, g: Geo, color: string): string {
    const { cx, cy, headW, headH } = g;
    const top = cy - headH / 2;

    switch (type) {
        case "beanie":
            return (
                `<path d="M ${cx - headW / 2 - 2} ${top + 5} Q ${cx - headW / 2 - 2} ${top - 12} ${cx} ${top - 14} Q ${cx + headW / 2 + 2} ${top - 12} ${cx + headW / 2 + 2} ${top + 5}" fill="${color}"/>` +
                `<rect x="${cx - headW / 2 - 3}" y="${top + 2}" width="${headW + 6}" height="5" rx="2" fill="${color}" opacity="0.7"/>`
            );
        case "cap":
            return (
                `<path d="M ${cx - headW / 2 - 2} ${top + 3} Q ${cx} ${top - 10} ${cx + headW / 2 + 2} ${top + 3}" fill="${color}"/>` +
                `<rect x="${cx - headW / 2 - 8}" y="${top + 1}" width="${headW + 16}" height="3" rx="1.5" fill="${color}" opacity="0.8"/>`
            );
        case "tophat":
            return (
                `<rect x="${cx - 8}" y="${top - 18}" width="16" height="18" rx="2" fill="${color}"/>` +
                `<rect x="${cx - headW / 2 - 4}" y="${top - 2}" width="${headW + 8}" height="4" rx="2" fill="${color}"/>`
            );
    }
}

function drawEarrings(g: Geo, color: string): string {
    const { cx, eyeY, headW } = g;
    const earY = eyeY + 4;
    return (
        `<circle cx="${cx - headW / 2 - 2}" cy="${earY}" r="1.5" fill="${color}"/>` +
        `<circle cx="${cx + headW / 2 + 2}" cy="${earY}" r="1.5" fill="${color}"/>`
    );
}

/** The lower face, from the sideburns around the chin, leaving room for the mouth. */
function jaw(g: Geo, color: string): string {
    const { cx, cy, headW, headH, mouthY } = g;
    const left = cx - headW / 2;
    const right = cx + headW / 2;
    const chin = cy + headH / 2;
    return `<path d="M ${left + 0.2} ${cy + 1} C ${left + 0.5} ${chin - 3} ${cx - 8} ${chin + 0.5} ${cx} ${chin + 0.5} C ${cx + 8} ${chin + 0.5} ${right - 0.5} ${chin - 3} ${right - 0.2} ${cy + 1} C ${right - 3} ${mouthY - 5} ${cx + 8} ${mouthY - 3} ${cx} ${mouthY - 3} C ${cx - 8} ${mouthY - 3} ${left + 3} ${mouthY - 5} ${left + 0.2} ${cy + 1} Z" fill="${color}"/>`;
}

function drawFacialHair(type: FacialHairType, g: Geo, color: string): string {
    const { cx, mouthY } = g;

    switch (type) {
        case "stubble":
            return `<g opacity="0.22">${jaw(g, color)}</g>`;
        case "mustache":
            return `<path d="M ${cx - 7} ${mouthY - 1} Q ${cx - 3} ${mouthY - 4} ${cx} ${mouthY - 2} Q ${cx + 3} ${mouthY - 4} ${cx + 7} ${mouthY - 1}" fill="${color}"/>`;
        case "beard":
            return jaw(g, color);
    }
}

// ============================================================================
// Main content builder
// ============================================================================

/** What the seed decides for one illustrated avatar. */
export interface IllustratedTraits {
    skinColor: string;
    hairColor: string;
    shirtColor: string;
    featureColor: string;
    eyeColor: string;
    hairStyle: HairStyle;
    eyeStyle: EyeStyle;
    eyebrowStyle: EyebrowStyle;
    noseStyle: NoseStyle;
    mouthStyle: MouthStyle;
    glassesType: GlassesType | null;
    hatType: HatType | null;
    facialHairType: FacialHairType | null;
    earringColor: string | null;
    hatColor: string | null;
}

/**
 * The order of these draws is part of the output: reordering them changes every
 * avatar for every seed.
 */
function prepareIllustrated(options: IllustratedOptions, random: Random): IllustratedTraits {
    const skinTones = options.skinTones ?? SKIN_TONES;
    const eyeColorPalette = options.eyeColors ?? EYE_COLORS;
    const colors = options.colors ?? DEFAULT_COLORS;

    const skinColor = random.pick(skinTones);
    // Apart from the skin, or a short cut would read as a bald head.
    const hairColor = pickContrasting(random, HAIR_COLORS, skinColor, 1.6);
    const shirtColor = random.pick(SHIRTS);
    const eyeColor = random.pick(eyeColorPalette);

    // Pick features
    const hairStyle: HairStyle = options.hairStyle ?? random.pick(HAIR_STYLES);
    const eyeStyle: EyeStyle = options.eyeStyle ?? random.pick(FRIENDLY_EYES);
    const eyebrowStyle: EyebrowStyle = options.eyebrowStyle ?? random.pick(FRIENDLY_EYEBROWS);
    const noseStyle: NoseStyle = options.noseStyle ?? random.pick(NOSE_STYLES);
    const mouthStyle: MouthStyle = options.mouthStyle ?? random.pick(FRIENDLY_MOUTHS);

    // Accessories probabilities
    const hasGlasses = options.glasses !== false && random.bool(0.2);
    const hasHat = options.hat !== false && random.bool(0.1);
    const hasEarrings = options.earrings !== false && random.bool(0.08);
    const hasFacialHair = options.facialHair !== false && random.bool(0.15);

    const glassesType = hasGlasses ? random.pick(GLASSES_TYPES) : null;
    const hatType = hasHat ? random.pick(HAT_TYPES) : null;
    const facialHairType = hasFacialHair ? random.pick(FACIAL_HAIR_TYPES) : null;
    const earringColor = hasEarrings ? random.pick(colors) : null;
    const hatColor = hatType ? random.pick(colors) : null;

    return {
        skinColor,
        hairColor,
        shirtColor,
        featureColor: contrastRatio(skinColor, "#2C1810") >= 3 ? "#2C1810" : "#120A06",
        eyeColor,
        hairStyle,
        eyeStyle,
        eyebrowStyle,
        noseStyle,
        mouthStyle,
        glassesType,
        hatType,
        facialHairType,
        earringColor,
        hatColor,
    };
}

/**
 * Illustrated avatar style
 *
 * Creates detailed cartoon face avatars with varied hair, eyes, eyebrows,
 * nose, mouth, and optional accessories (glasses, hats, earrings, facial hair).
 * Over 1.7M+ unique combinations before accessories.
 *
 * Its features can be mixed with other styles: `hair`, `ears`, `head`,
 * `eyebrows`, `eyes`, `nose`, `mouth`, `facial-hair`, `glasses`, `earrings` and `hat`.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { illustrated } from '@avatar-generator/style-illustrated';
 *
 * const avatar = createAvatar(illustrated, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const illustrated: ComposableStyle<IllustratedOptions, IllustratedTraits> = defineStyle<
    IllustratedOptions,
    IllustratedTraits
>({
    name: "illustrated",
    canvas: CANVAS,

    validate(options) {
        validateOption("illustrated", "hairStyle", options.hairStyle, HAIR_STYLES);
        validateOption("illustrated", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("illustrated", "eyebrowStyle", options.eyebrowStyle, EYEBROW_STYLES);
        validateOption("illustrated", "noseStyle", options.noseStyle, NOSE_STYLES);
        validateOption("illustrated", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
    },

    prepare: prepareIllustrated,

    head: (size) => {
        const { cx, cy, headW, headH } = computeGeo(size);
        return { x: cx - headW / 2, y: cy - headH / 2, width: headW, height: headH };
    },

    layers: [
        {
            name: "hair-behind",
            feature: "hair",
            render: ({ traits, size }) => drawHairBehind(traits.hairStyle, computeGeo(size), traits.hairColor),
        },
        {
            name: "body",
            render: ({ traits, size }) => {
                const g = computeGeo(size);
                const chin = g.cy + g.headH / 2;
                return (
                    `<path d="M 10 64 C 10 52 20 48 ${g.cx} 48 C 44 48 54 52 54 64 Z" fill="${traits.shirtColor}"/>` +
                    `<rect x="${g.cx - 5}" y="${chin - 4}" width="10" height="${48 - chin + 6}" rx="3" fill="${traits.skinColor}"/>`
                );
            },
        },
        {
            name: "ears",
            render: ({ traits, size }) => {
                const g = computeGeo(size);
                const earR = size * 0.055;
                const earY = g.eyeY + 2;
                return (
                    `<ellipse cx="${g.cx - g.headW / 2 - earR * 0.5}" cy="${earY}" rx="${earR}" ry="${earR * 1.2}" fill="${traits.skinColor}"/>` +
                    `<ellipse cx="${g.cx + g.headW / 2 + earR * 0.5}" cy="${earY}" rx="${earR}" ry="${earR * 1.2}" fill="${traits.skinColor}"/>`
                );
            },
        },
        {
            name: "head",
            render: ({ traits, size }) => {
                const g = computeGeo(size);
                return `<ellipse cx="${g.cx}" cy="${g.cy}" rx="${g.headW / 2}" ry="${g.headH / 2}" fill="${traits.skinColor}"/>`;
            },
        },
        {
            name: "hair-front",
            feature: "hair",
            render: ({ traits, size }) => drawHairFront(traits.hairStyle, computeGeo(size), traits.hairColor),
        },
        {
            name: "eyebrows",
            // In the hair's colour, as near-black brows overpower the face.
            render: ({ traits, size }) => drawEyebrows(traits.eyebrowStyle, computeGeo(size), traits.hairColor),
        },
        {
            name: "eyes",
            render: ({ traits, size }) =>
                drawEyes(traits.eyeStyle, computeGeo(size), traits.featureColor, traits.eyeColor),
        },
        {
            name: "facial-hair",
            render: ({ traits, size }) =>
                traits.facialHairType ? drawFacialHair(traits.facialHairType, computeGeo(size), traits.hairColor) : "",
        },
        {
            name: "nose",
            render: ({ traits, size }) => drawNose(traits.noseStyle, computeGeo(size), traits.featureColor),
        },
        {
            name: "mouth",
            render: ({ traits, size }) => drawMouth(traits.mouthStyle, computeGeo(size), traits.featureColor),
        },
        {
            name: "glasses",
            render: ({ traits, size }) =>
                traits.glassesType ? drawGlasses(traits.glassesType, computeGeo(size), traits.featureColor) : "",
        },
        {
            name: "earrings",
            render: ({ traits, size }) =>
                traits.earringColor ? drawEarrings(computeGeo(size), traits.earringColor) : "",
        },
        {
            // Drawn last, on top of everything
            name: "hat",
            render: ({ traits, size }) =>
                traits.hatType && traits.hatColor ? drawHat(traits.hatType, computeGeo(size), traits.hatColor) : "",
        },
    ],
});

export default illustrated;
