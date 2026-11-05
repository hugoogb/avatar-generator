import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import { defineStyle, SKIN_TONES, validateOption } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type AnimeHairStyle =
    | "short-spiky"
    | "medium-messy"
    | "long-straight"
    | "twin-tails"
    | "ponytail"
    | "side-swept"
    | "wild"
    | "bob"
    | "hime-cut"
    | "shaggy";

export type AnimeEyeStyle =
    "normal" | "sparkly" | "determined" | "gentle" | "cat" | "half-closed" | "closed-happy" | "surprised";

export type AnimeMouthStyle = "small-smile" | "open-small" | "cat-mouth" | "line" | "pout" | "grin";

export type AnimeNoseStyle = "dot" | "line" | "shadow";

export interface AnimeOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Custom eye color palette */
    eyeColors?: string[];
    /** Override hair style */
    hairStyle?: AnimeHairStyle;
    /** Override eye style */
    eyeStyle?: AnimeEyeStyle;
    /** Override mouth style */
    mouthStyle?: AnimeMouthStyle;
    /** Override nose style */
    noseStyle?: AnimeNoseStyle;
    /** Reserved for future expression overrides (currently no-op) */
    expression?: string;
    /** Enable bangs (default: random) */
    bangs?: boolean;
    /** Enable ahoge hair strand (default: random, 40% chance) */
    ahoge?: boolean;
    /** Enable blush (default: random, 35% chance) */
    blush?: boolean;
    /** Enable accessories (default: true) */
    accessories?: boolean;
}

// ─── Abstract style option unions ─────────────────────────────────────────

// ============================================================================
// Feature variant types
// ============================================================================

type HairStyle = AnimeHairStyle;
type EyeStyle = AnimeEyeStyle;
type MouthStyle = AnimeMouthStyle;
type NoseStyle = AnimeNoseStyle;
type EyebrowStyle = "natural" | "furrowed" | "raised" | "thin";

/** All valid hair style values for the anime style */
export const HAIR_STYLES: HairStyle[] = [
    "short-spiky",
    "medium-messy",
    "long-straight",
    "twin-tails",
    "ponytail",
    "side-swept",
    "wild",
    "bob",
    "hime-cut",
    "shaggy",
];

/** All valid eye style values for the anime style */
export const EYE_STYLES: EyeStyle[] = [
    "normal",
    "sparkly",
    "determined",
    "gentle",
    "cat",
    "half-closed",
    "closed-happy",
    "surprised",
];

/** All valid mouth style values for the anime style */
export const MOUTH_STYLES: MouthStyle[] = ["small-smile", "open-small", "cat-mouth", "line", "pout", "grin"];

/** All valid nose style values for the anime style */
export const NOSE_STYLES: NoseStyle[] = ["dot", "line", "shadow"];

// A profile picture should not look upset by accident.
const EYEBROW_STYLES: EyebrowStyle[] = ["natural", "raised", "thin"];
const FRIENDLY_EYES = EYE_STYLES.filter((style) => style !== "half-closed");
// Smiling twice over, as a dark open mouth on a third of avatars looks like a gasp.
const FRIENDLY_MOUTHS: MouthStyle[] = [...MOUTH_STYLES.filter((style) => style !== "pout"), "small-smile"];
const EYE_TONES = ["#3B82C4", "#2E9E7E", "#7C5CD6", "#B8691F", "#C2477F", "#2F6FB0"];

// Anime-typical hair colors (includes unnatural colors)
const ANIME_HAIR_COLORS = [
    "#1a1a2e",
    "#2d1b36",
    "#4a1942",
    "#c23616",
    "#e17055",
    "#0984e3",
    "#6c5ce7",
    "#fd79a8",
    "#ffeaa7",
    "#dfe6e9",
    "#2d3436",
    "#b2bec3",
];

// ============================================================================
// Geometry helper
// ============================================================================

interface AnimeGeo {
    size: number;
    cx: number;
    cy: number;
    headW: number;
    headH: number;
    faceTop: number;
    chinY: number;
    eyeY: number;
    eyeSpacing: number;
    eyeRx: number;
    eyeRy: number;
    irisR: number;
    browY: number;
    noseY: number;
    mouthY: number;
}

/** Drawn in this coordinate space and scaled, so details stay in proportion. */
const CANVAS = 64;
const COLLARS = ["#1F2937", "#F3F4F6", "#374151", "#1D4ED8", "#B91C1C"];

function computeGeo(size: number): AnimeGeo {
    const cx = size / 2;
    const cy = size * 0.45;
    const headW = size * 0.55;
    const headH = size * 0.53;
    const eyeRy = headH * 0.15;
    return {
        size,
        cx,
        cy,
        headW,
        headH,
        faceTop: cy - headH * 0.52,
        chinY: cy + headH * 0.5,
        // Low on the face and wide apart, which is what reads as anime and as young.
        eyeY: cy + headH * 0.05,
        eyeSpacing: headW * 0.25,
        eyeRx: headW * 0.13,
        eyeRy,
        irisR: eyeRy * 0.8,
        browY: cy + headH * 0.05 - eyeRy * 1.75,
        noseY: cy + headH * 0.25,
        mouthY: cy + headH * 0.33,
    };
}

// ============================================================================
// Face shape (V-chin bezier path)
// ============================================================================

function drawFace(g: AnimeGeo, skinColor: string): string {
    const { cx, cy, headW, headH, faceTop, chinY } = g;
    const halfW = headW / 2;
    // A round forehead and full cheeks, tapering gently to a soft chin.
    const cheekY = cy + headH * 0.08;
    return (
        `<path d="M ${cx} ${faceTop} ` +
        `C ${cx + halfW * 0.72} ${faceTop} ${cx + halfW} ${cy - headH * 0.3} ${cx + halfW} ${cheekY} ` +
        `C ${cx + halfW} ${cy + headH * 0.33} ${cx + halfW * 0.42} ${chinY} ${cx} ${chinY} ` +
        `C ${cx - halfW * 0.42} ${chinY} ${cx - halfW} ${cy + headH * 0.33} ${cx - halfW} ${cheekY} ` +
        `C ${cx - halfW} ${cy - headH * 0.3} ${cx - halfW * 0.72} ${faceTop} ${cx} ${faceTop} Z" ` +
        `fill="${skinColor}"/>`
    );
}

// ============================================================================
// Ears
// ============================================================================

function drawEars(g: AnimeGeo, skinColor: string): string {
    const { cx, headW, eyeY } = g;
    const earR = g.size * 0.04;
    const earY = eyeY + 2;
    return (
        `<ellipse cx="${cx - headW / 2 - earR * 0.3}" cy="${earY}" rx="${earR}" ry="${earR * 1.3}" fill="${skinColor}"/>` +
        `<ellipse cx="${cx + headW / 2 + earR * 0.3}" cy="${earY}" rx="${earR}" ry="${earR * 1.3}" fill="${skinColor}"/>`
    );
}

// ============================================================================
// Hair rendering — sharp polygons + layered bangs
// ============================================================================

/** A smooth mass around the head, reaching down to `bottom`. */
function hairMass(g: AnimeGeo, color: string, spread: number, bottom: number): string {
    const { cx, faceTop, headW } = g;
    const left = cx - headW / 2 - spread;
    const right = cx + headW / 2 + spread;
    const top = faceTop - 3;
    return `<path d="M ${left} ${bottom} C ${left - 1} ${top - 3} ${right + 1} ${top - 3} ${right} ${bottom} Q ${cx} ${bottom + 3} ${left} ${bottom} Z" fill="${color}"/>`;
}

/** Sharp tufts along the crown, which give spiky styles their silhouette. */
function tufts(g: AnimeGeo, color: string, height: number): string {
    const { cx, faceTop, headW } = g;
    const halfW = headW / 2 + 2;
    const y = faceTop + 2;
    return `<path d="M ${cx - halfW} ${y + 7} L ${cx - halfW * 0.72} ${y - height * 0.6} L ${cx - halfW * 0.42} ${y - 1} L ${cx - halfW * 0.15} ${y - height} L ${cx + halfW * 0.15} ${y - 1} L ${cx + halfW * 0.42} ${y - height * 0.85} L ${cx + halfW * 0.6} ${y - 1} L ${cx + halfW * 0.8} ${y - height * 0.5} L ${cx + halfW} ${y + 7} Z" fill="${color}"/>`;
}

function drawHairBehind(style: HairStyle, g: AnimeGeo, color: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;

    switch (style) {
        case "short-spiky":
            return hairMass(g, color, 2, cy + 2) + tufts(g, color, 7);
        case "medium-messy":
            return hairMass(g, color, 3, cy + 9) + tufts(g, color, 5);
        case "long-straight":
            return hairMass(g, color, 4, 62);
        case "twin-tails":
            return (
                hairMass(g, color, 2, cy + 2) +
                `<ellipse cx="${cx - halfW - 5}" cy="${cy + 8}" rx="4.5" ry="13" fill="${color}" transform="rotate(8 ${cx - halfW - 5} ${cy + 8})"/>` +
                `<ellipse cx="${cx + halfW + 5}" cy="${cy + 8}" rx="4.5" ry="13" fill="${color}" transform="rotate(-8 ${cx + halfW + 5} ${cy + 8})"/>`
            );
        case "ponytail":
            return (
                `<path d="M ${cx + halfW - 3} ${cy - 10} C ${cx + halfW + 9} ${cy - 10} ${cx + halfW + 10} ${cy + 14} ${cx + halfW + 3} ${cy + 20} C ${cx + halfW + 4} ${cy + 10} ${cx + halfW + 1} ${cy} ${cx + halfW - 3} ${cy - 2} Z" fill="${color}"/>` +
                hairMass(g, color, 2, cy + 1)
            );
        case "side-swept":
            return hairMass(g, color, 3, cy + 5);
        case "wild":
            return hairMass(g, color, 5, cy + 10) + tufts(g, color, 9);
        case "bob":
            return hairMass(g, color, 4, cy + headH * 0.32);
        case "hime-cut":
            return hairMass(g, color, 3, 60);
        case "shaggy":
            return hairMass(g, color, 4, cy + 12) + tufts(g, color, 4);
    }
}

function drawHairFront(style: HairStyle, g: AnimeGeo, color: string, hasBangs: boolean): string {
    const { cx, cy, headW, headH, faceTop } = g;
    const halfW = headW / 2;

    // Over the crown, so that a face without bangs does not read as bald.
    const crown = `<path d="M ${cx - halfW - 0.5} ${cy - 3} C ${cx - halfW - 1} ${faceTop - 7} ${cx + halfW + 1} ${faceTop - 7} ${cx + halfW + 0.5} ${cy - 3} C ${cx + halfW - 2} ${faceTop + 5} ${cx - halfW + 2} ${faceTop + 5} ${cx - halfW - 0.5} ${cy - 3} Z" fill="${color}"/>`;

    // Bangs layer — sharp spikes over the forehead
    let bangs = "";
    if (hasBangs) {
        const top = faceTop - 1;
        const tip = faceTop + headH * 0.2;
        bangs =
            `<path d="M ${cx - halfW} ${top + 3} ` +
            `L ${cx - halfW * 0.72} ${tip} ` +
            `L ${cx - halfW * 0.45} ${top + 5} ` +
            `L ${cx - halfW * 0.2} ${tip + 1.5} ` +
            `L ${cx + halfW * 0.02} ${top + 5} ` +
            `L ${cx + halfW * 0.28} ${tip + 1.5} ` +
            `L ${cx + halfW * 0.5} ${top + 5} ` +
            `L ${cx + halfW * 0.75} ${tip} ` +
            `L ${cx + halfW} ${top + 3} Z" fill="${color}"/>`;
    }

    // Side locks that frame the face
    let locks = "";
    if (style === "hime-cut") {
        const y = cy - headH * 0.1;
        locks =
            `<rect x="${cx - halfW - 1.5}" y="${y}" width="5" height="${headH * 0.5}" rx="1.5" fill="${color}"/>` +
            `<rect x="${cx + halfW - 3.5}" y="${y}" width="5" height="${headH * 0.5}" rx="1.5" fill="${color}"/>`;
    }

    return crown + bangs + locks;
}

// ============================================================================
// Eyes rendering — the star feature (multi-layer)
// ============================================================================

function drawEyes(style: EyeStyle, g: AnimeGeo, featureColor: string, eyeColor: string): string {
    const { cx, eyeY, eyeSpacing, eyeRx, eyeRy } = g;
    const lash = (d: string, width = 1.6) =>
        `<path d="${d}" fill="none" stroke="${featureColor}" stroke-width="${width}" stroke-linecap="round"/>`;

    /** Large, tall iris, a dark upper lash and a bright catchlight, nothing fussier. */
    const openEye = (x: number, height = 1, irisScale = 1): string => {
        const ry = eyeRy * height;
        const irisRx = eyeRx * 0.8 * irisScale;
        const irisRy = ry * 0.86 * irisScale;
        const y = eyeY + (ry - irisRy) * 0.5;
        return (
            `<ellipse cx="${x}" cy="${eyeY}" rx="${eyeRx}" ry="${ry}" fill="#fff"/>` +
            `<ellipse cx="${x}" cy="${y}" rx="${irisRx}" ry="${irisRy}" fill="${eyeColor}"/>` +
            `<ellipse cx="${x}" cy="${y + irisRy * 0.12}" rx="${irisRx * 0.55}" ry="${irisRy * 0.6}" fill="#17110D"/>` +
            `<circle cx="${x + irisRx * 0.35}" cy="${y - irisRy * 0.42}" r="${irisRx * 0.4}" fill="#fff"/>` +
            `<circle cx="${x - irisRx * 0.35}" cy="${y + irisRy * 0.42}" r="${irisRx * 0.2}" fill="#fff" opacity="0.85"/>` +
            lash(
                `M ${x - eyeRx - 0.3} ${eyeY - ry * 0.5} Q ${x} ${eyeY - ry * 1.32} ${x + eyeRx + 0.3} ${eyeY - ry * 0.5}`,
            )
        );
    };

    const drawOne = (x: number): string => {
        switch (style) {
            case "normal":
            case "gentle":
                return openEye(x);
            case "sparkly":
                return (
                    openEye(x) +
                    `<circle cx="${x + eyeRx * 0.05}" cy="${eyeY + eyeRy * 0.05}" r="${eyeRx * 0.16}" fill="#fff"/>`
                );
            case "determined":
                return openEye(x, 0.9);
            case "cat":
                return (
                    `<ellipse cx="${x}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy * 0.82}" fill="#fff"/>` +
                    `<ellipse cx="${x}" cy="${eyeY}" rx="${eyeRx * 0.76}" ry="${eyeRy * 0.74}" fill="${eyeColor}"/>` +
                    `<ellipse cx="${x}" cy="${eyeY}" rx="${eyeRx * 0.2}" ry="${eyeRy * 0.62}" fill="#17110D"/>` +
                    `<circle cx="${x + eyeRx * 0.3}" cy="${eyeY - eyeRy * 0.34}" r="${eyeRx * 0.24}" fill="#fff"/>` +
                    lash(
                        `M ${x - eyeRx - 0.3} ${eyeY - eyeRy * 0.35} Q ${x} ${eyeY - eyeRy * 1.1} ${x + eyeRx + 0.3} ${eyeY - eyeRy * 0.35}`,
                    )
                );
            case "half-closed": {
                const lid = eyeY - eyeRy * 0.1;
                return (
                    `<path d="M ${x - eyeRx} ${lid} H ${x + eyeRx} A ${eyeRx} ${eyeRy * 0.9} 0 0 1 ${x - eyeRx} ${lid} Z" fill="#fff"/>` +
                    `<path d="M ${x - eyeRx * 0.72} ${lid} H ${x + eyeRx * 0.72} A ${eyeRx * 0.72} ${eyeRy * 0.74} 0 0 1 ${x - eyeRx * 0.72} ${lid} Z" fill="${eyeColor}"/>` +
                    `<path d="M ${x - eyeRx * 0.38} ${lid} H ${x + eyeRx * 0.38} A ${eyeRx * 0.38} ${eyeRy * 0.42} 0 0 1 ${x - eyeRx * 0.38} ${lid} Z" fill="#17110D"/>` +
                    lash(`M ${x - eyeRx - 0.3} ${lid} H ${x + eyeRx + 0.3}`)
                );
            }
            case "closed-happy":
                return lash(
                    `M ${x - eyeRx} ${eyeY + 1.5} Q ${x} ${eyeY - eyeRy * 0.75} ${x + eyeRx} ${eyeY + 1.5}`,
                    1.8,
                );
            case "surprised":
                return openEye(x, 1.05, 0.72);
        }
    };

    return drawOne(cx - eyeSpacing) + drawOne(cx + eyeSpacing);
}

// ============================================================================
// Eyebrows rendering
// ============================================================================

function drawEyebrows(style: EyebrowStyle, g: AnimeGeo, color: string): string {
    const { cx, browY, eyeSpacing, eyeRx } = g;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;
    const bw = eyeRx * 0.85;
    /** Short and light, high above the eye, from the outer end to the inner end. */
    const pair = (lift: number, inner: number, width: number) =>
        `<path d="M ${lx - bw} ${browY + 0.5} Q ${lx} ${browY - lift} ${lx + bw} ${browY + inner}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>` +
        `<path d="M ${rx + bw} ${browY + 0.5} Q ${rx} ${browY - lift} ${rx - bw} ${browY + inner}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

    switch (style) {
        case "natural":
            return pair(1, 0.3, 1);
        case "furrowed":
            return pair(0.2, 1.2, 1.1);
        case "raised":
            return pair(2, 0, 1);
        case "thin":
            return pair(0.8, 0.2, 0.7);
    }
}

// ============================================================================
// Nose rendering — minimal
// ============================================================================

function drawNose(style: NoseStyle, g: AnimeGeo, color: string): string {
    const { cx, noseY } = g;

    switch (style) {
        case "dot":
            return `<circle cx="${cx}" cy="${noseY}" r="1" fill="${color}" opacity="0.5"/>`;
        case "line":
            return `<path d="M ${cx + 0.5} ${noseY - 2} L ${cx + 0.5} ${noseY + 1} L ${cx - 1} ${noseY + 1}" fill="none" stroke="${color}" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>`;
        case "shadow":
            return `<ellipse cx="${cx}" cy="${noseY}" rx="1.5" ry="1" fill="${color}" opacity="0.2"/>`;
    }
}

// ============================================================================
// Mouth rendering — small, positioned lower
// ============================================================================

function drawMouth(style: MouthStyle, g: AnimeGeo, color: string): string {
    const { cx, mouthY } = g;

    switch (style) {
        case "small-smile":
            return `<path d="M ${cx - 3} ${mouthY} Q ${cx} ${mouthY + 3} ${cx + 3} ${mouthY}" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round"/>`;
        case "open-small":
            return (
                `<ellipse cx="${cx}" cy="${mouthY + 1}" rx="2.5" ry="2" fill="#4a2020"/>` +
                `<ellipse cx="${cx}" cy="${mouthY + 2}" rx="1.5" ry="0.8" fill="#FF6B6B" opacity="0.5"/>`
            );
        case "cat-mouth":
            // :3 shape
            return (
                `<path d="M ${cx - 3.5} ${mouthY + 1} Q ${cx - 1.5} ${mouthY + 3.5} ${cx} ${mouthY + 1}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linecap="round"/>` +
                `<path d="M ${cx} ${mouthY + 1} Q ${cx + 1.5} ${mouthY + 3.5} ${cx + 3.5} ${mouthY + 1}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linecap="round"/>`
            );
        case "line":
            return `<line x1="${cx - 2.5}" y1="${mouthY + 1}" x2="${cx + 2.5}" y2="${mouthY + 1}" stroke="${color}" stroke-width="1" stroke-linecap="round"/>`;
        case "pout":
            return `<path d="M ${cx - 2.5} ${mouthY + 1.5} Q ${cx} ${mouthY - 1} ${cx + 2.5} ${mouthY + 1.5}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`;
        case "grin":
            return (
                `<path d="M ${cx - 4} ${mouthY} Q ${cx} ${mouthY + 5} ${cx + 4} ${mouthY}" fill="white" stroke="${color}" stroke-width="0.8"/>` +
                `<path d="M ${cx - 3} ${mouthY + 3} Q ${cx} ${mouthY + 4.5} ${cx + 3} ${mouthY + 3}" fill="#FF6B6B" opacity="0.4"/>`
            );
    }
}

// ============================================================================
// Expressions — anime-specific
// ============================================================================

function drawExpressions(random: Random, g: AnimeGeo, hasBlush: boolean): string {
    const { cx, cy, headW, eyeY, eyeRy, faceTop } = g;
    let content = "";

    // Blush — pink ovals on cheeks (35%)
    if (hasBlush) {
        const blushY = eyeY + eyeRy * 1.3;
        const blushSpacing = headW * 0.36;
        content +=
            `<ellipse cx="${cx - blushSpacing}" cy="${blushY}" rx="3.5" ry="2" fill="#FF9999" opacity="0.35"/>` +
            `<ellipse cx="${cx + blushSpacing}" cy="${blushY}" rx="3.5" ry="2" fill="#FF9999" opacity="0.35"/>`;
    }

    // Sweat drop — teardrop on forehead side (15%)
    if (random.bool(0.15)) {
        const sdx = cx + headW * 0.32;
        const sdy = faceTop + 8;
        content += `<path d="M ${sdx} ${sdy - 3} Q ${sdx + 2} ${sdy} ${sdx} ${sdy + 3} Q ${sdx - 2} ${sdy} ${sdx} ${sdy - 3} Z" fill="#87CEEB" opacity="0.7"/>`;
    }

    // Sparkles — small 4-point stars near face (20%)
    if (random.bool(0.2)) {
        const sx = cx + headW * 0.38;
        const sy = eyeY - eyeRy * 0.5;
        const sr = 1.8;
        content += `<path d="M ${sx} ${sy - sr} L ${sx + sr * 0.3} ${sy - sr * 0.3} L ${sx + sr} ${sy} L ${sx + sr * 0.3} ${sy + sr * 0.3} L ${sx} ${sy + sr} L ${sx - sr * 0.3} ${sy + sr * 0.3} L ${sx - sr} ${sy} L ${sx - sr * 0.3} ${sy - sr * 0.3} Z" fill="#FFD700" opacity="0.6"/>`;
        // Second smaller sparkle
        const s2x = sx - 3;
        const s2y = sy - 3;
        const s2r = 1.1;
        content += `<path d="M ${s2x} ${s2y - s2r} L ${s2x + s2r * 0.3} ${s2y - s2r * 0.3} L ${s2x + s2r} ${s2y} L ${s2x + s2r * 0.3} ${s2y + s2r * 0.3} L ${s2x} ${s2y + s2r} L ${s2x - s2r * 0.3} ${s2y + s2r * 0.3} L ${s2x - s2r} ${s2y} L ${s2x - s2r * 0.3} ${s2y - s2r * 0.3} Z" fill="#FFD700" opacity="0.4"/>`;
    }

    // Anger vein — cross/hash mark on forehead (10%)
    if (random.bool(0.1)) {
        const ax = cx + headW * 0.18;
        const ay = faceTop + 6;
        content += `<path d="M ${ax - 2} ${ay - 1.5} Q ${ax} ${ay} ${ax + 2} ${ay - 1.5} M ${ax - 1.5} ${ay - 2} Q ${ax} ${ay} ${ax - 1.5} ${ay + 2} M ${ax + 1.5} ${ay - 2} Q ${ax} ${ay} ${ax + 1.5} ${ay + 2} M ${ax - 2} ${ay + 1.5} Q ${ax} ${ay} ${ax + 2} ${ay + 1.5}" fill="none" stroke="#CC3333" stroke-width="0.8" opacity="0.7"/>`;
    }

    // Expression lines — parallel diagonal lines near cheek (15%)
    if (random.bool(0.15)) {
        const elx = cx - headW * 0.38;
        const ely = cy + 2;
        content +=
            `<line x1="${elx}" y1="${ely - 2}" x2="${elx - 2}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>` +
            `<line x1="${elx + 1.5}" y1="${ely - 2}" x2="${elx - 0.5}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>` +
            `<line x1="${elx + 3}" y1="${ely - 2}" x2="${elx + 1}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>`;
    }

    return content;
}

// ============================================================================
// Accessories
// ============================================================================

function drawAccessories(random: Random, g: AnimeGeo, _skinColor: string): string {
    const { cx, headW, faceTop, eyeY, eyeRy } = g;
    let content = "";

    // Bandaid on cheek (5%)
    if (random.bool(0.05)) {
        const bx = cx + headW * 0.34;
        const by = eyeY + eyeRy * 1.6;
        content += `<rect x="${bx - 3}" y="${by - 1}" width="6" height="2.5" rx="0.5" fill="#F5DEB3" stroke="#DEB887" stroke-width="0.3" transform="rotate(-15 ${bx} ${by})"/>`;
    }

    // Headband across forehead (8%)
    if (random.bool(0.08)) {
        const hby = faceTop + 4;
        content += `<path d="M ${cx - headW * 0.48} ${hby + 1} Q ${cx} ${hby - 2} ${cx + headW * 0.48} ${hby + 1}" fill="none" stroke="#CC3333" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
    }

    return content;
}

// ============================================================================
// Ahoge — single upward-pointing hair strand
// ============================================================================

function drawAhoge(g: AnimeGeo, hairColor: string): string {
    const { cx, faceTop } = g;
    // Stops short of the top of the frame, where a clip would cut it off.
    const y = faceTop - 2;
    return `<path d="M ${cx - 1.4} ${y + 2} Q ${cx - 3} ${y - 3} ${cx + 2.5} ${y - 6} Q ${cx + 0.5} ${y - 2} ${cx + 1.4} ${y + 2} Z" fill="${hairColor}"/>`;
}

// ============================================================================
// Main content builder
// ============================================================================

/** What the seed decides for one anime avatar. */
export interface AnimeTraits {
    collarColor: string;
    skinColor: string;
    hairColor: string;
    featureColor: string;
    eyeColor: string;
    hairStyle: HairStyle;
    eyeStyle: EyeStyle;
    mouthStyle: MouthStyle;
    noseStyle: NoseStyle;
    eyebrowStyle: EyebrowStyle;
    hasBangs: boolean;
    hasAhoge: boolean;
    /** Pre-drawn because each mark is a separate draw from the same sequence. */
    expressions: string;
    /** Pre-drawn for the same reason. */
    accessories: string;
}

/**
 * The order of these draws is part of the output: reordering them changes every
 * avatar for every seed.
 */
function prepareAnime(options: AnimeOptions, random: Random): AnimeTraits {
    const size = options.size ?? 64;
    const skinTones = options.skinTones ?? SKIN_TONES;
    const eyeColorPalette = options.eyeColors ?? EYE_TONES;

    const skinColor = random.pick(skinTones);
    const hairColor = random.pick(ANIME_HAIR_COLORS);
    const eyeColor = random.pick(eyeColorPalette);
    const collarColor = random.pick(COLLARS);

    // Pick features
    const hairStyle: HairStyle = options.hairStyle ?? random.pick(HAIR_STYLES);
    const eyeStyle: EyeStyle = options.eyeStyle ?? random.pick(FRIENDLY_EYES);
    const mouthStyle: MouthStyle = options.mouthStyle ?? random.pick(FRIENDLY_MOUTHS);
    const noseStyle: NoseStyle = options.noseStyle ?? random.pick(NOSE_STYLES);
    const eyebrowStyle: EyebrowStyle = random.pick(EYEBROW_STYLES);

    // Expression / accessory probabilities
    const hasBangs = options.bangs ?? random.bool(0.6);
    const hasAhoge = options.ahoge ?? random.bool(0.4);
    const hasBlush = options.blush ?? random.bool(0.35);
    const enableAccessories = options.accessories !== false;

    const g = computeGeo(size);
    const expressions = drawExpressions(random, g, hasBlush);
    const accessories = enableAccessories ? drawAccessories(random, g, skinColor) : "";

    return {
        collarColor,
        skinColor,
        hairColor,
        featureColor: "#2C1810",
        eyeColor,
        hairStyle,
        eyeStyle,
        mouthStyle,
        noseStyle,
        eyebrowStyle,
        hasBangs,
        hasAhoge,
        expressions,
        accessories,
    };
}

/**
 * Anime avatar style
 *
 * Creates anime/manga-inspired face avatars with oversized expressive eyes,
 * V-shaped chin, dramatic spiky hair, and anime-specific expressions
 * (blush, sweat-drop, sparkles, anger-vein).
 * 20,000+ unique variants.
 *
 * Its features can be mixed with other styles: `hair`, `ears`, `head`,
 * `eyebrows`, `eyes`, `nose`, `mouth`, `expressions` and `accessories`.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { anime } from '@avatar-generator/style-anime';
 *
 * const avatar = createAvatar(anime, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const anime: ComposableStyle<AnimeOptions, AnimeTraits> = defineStyle<AnimeOptions, AnimeTraits>({
    name: "anime",
    canvas: CANVAS,

    validate(options) {
        validateOption("anime", "hairStyle", options.hairStyle, HAIR_STYLES);
        validateOption("anime", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("anime", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
        validateOption("anime", "noseStyle", options.noseStyle, NOSE_STYLES);
    },

    prepare: prepareAnime,

    head: (size) => {
        const { cx, headW, faceTop, chinY } = computeGeo(size);
        return { x: cx - headW / 2, y: faceTop, width: headW, height: chinY - faceTop };
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
                return (
                    `<path d="M 11 64 C 11 53 21 48.5 ${g.cx} 48.5 C 43 48.5 53 53 53 64 Z" fill="${traits.collarColor}"/>` +
                    `<rect x="${g.cx - 4.5}" y="${g.chinY - 5}" width="9" height="${50 - g.chinY + 5}" rx="3" fill="${traits.skinColor}"/>`
                );
            },
        },
        { name: "ears", render: ({ traits, size }) => drawEars(computeGeo(size), traits.skinColor) },
        // V-chin bezier path
        { name: "head", render: ({ traits, size }) => drawFace(computeGeo(size), traits.skinColor) },
        {
            // Bangs over forehead
            name: "hair-front",
            feature: "hair",
            render: ({ traits, size }) =>
                drawHairFront(traits.hairStyle, computeGeo(size), traits.hairColor, traits.hasBangs),
        },
        {
            name: "eyebrows",
            render: ({ traits, size }) => drawEyebrows(traits.eyebrowStyle, computeGeo(size), traits.featureColor),
        },
        {
            // The star feature — multi-layer
            name: "eyes",
            render: ({ traits, size }) =>
                drawEyes(traits.eyeStyle, computeGeo(size), traits.featureColor, traits.eyeColor),
        },
        {
            name: "nose",
            render: ({ traits, size }) => drawNose(traits.noseStyle, computeGeo(size), traits.featureColor),
        },
        {
            name: "mouth",
            render: ({ traits, size }) => drawMouth(traits.mouthStyle, computeGeo(size), traits.featureColor),
        },
        { name: "expressions", render: ({ traits }) => traits.expressions },
        { name: "accessories", render: ({ traits }) => traits.accessories },
        {
            // Single strand on top
            name: "ahoge",
            feature: "hair",
            render: ({ traits, size }) => (traits.hasAhoge ? drawAhoge(computeGeo(size), traits.hairColor) : ""),
        },
    ],
});

export default anime;
