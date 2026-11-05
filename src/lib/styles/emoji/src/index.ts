import type { AvatarOptions, AvatarResult, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, layerGroup, validateOption } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type EmojiExpression =
    "happy" | "laughing" | "cool" | "wink" | "love" | "sad" | "angry" | "surprised" | "sleepy" | "neutral";

export interface EmojiOptions extends AvatarOptions {
    /** Override the facial expression */
    expression?: EmojiExpression;
    /** Override the face fill color (default: yellow emoji palette) */
    faceColor?: string;
}

// ─── Animals style option unions ──────────────────────────────────────────

type Expression = EmojiExpression;

/** All valid expression values for the emoji style */
export const EXPRESSIONS: Expression[] = [
    "happy",
    "laughing",
    "cool",
    "wink",
    "love",
    "sad",
    "angry",
    "surprised",
    "sleepy",
    "neutral",
];

// Emoji-yellow face palette with slight variety.
const FACE_COLORS = ["#FFD93D", "#FFC93C", "#FFCC33", "#FFDC5E"];
// Cool backgrounds, so that a warm yellow face stands out on every one of them.
const BACKGROUNDS = ["#3B6FD9", "#6D5BD0", "#2A9D8F", "#3AA7D6", "#9A5BC9", "#C2478A"];
/** Drawn in this coordinate space and scaled, so strokes stay in proportion. */
const CANVAS = 64;
const STROKE = "#2C2C2C";
const BLUSH = "#FF6B6B";
const TEAR = "#4FC3F7";

interface EmojiGeo {
    cx: number;
    cy: number;
    r: number;
    eyeY: number;
    eyeSpacing: number;
    eyeR: number;
    mouthY: number;
}

function computeGeo(size: number): EmojiGeo {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.44;
    return {
        cx,
        cy,
        r,
        eyeY: cy - r * 0.18,
        eyeSpacing: r * 0.38,
        eyeR: r * 0.13,
        mouthY: cy + r * 0.28,
    };
}

// ─── Eyes ────────────────────────────────────────────────────────────────

function drawEyes(expression: Expression, g: EmojiGeo): string {
    const { cx, eyeY, eyeSpacing, eyeR } = g;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;

    switch (expression) {
        case "happy":
        case "neutral":
        case "sad":
        case "angry":
        case "surprised":
            return `<circle cx="${lx}" cy="${eyeY}" r="${eyeR}" fill="${STROKE}"/><circle cx="${rx}" cy="${eyeY}" r="${eyeR}" fill="${STROKE}"/>`;
        case "laughing":
            // Arcs curving upward like ")("
            return (
                `<path d="M ${lx - eyeR} ${eyeY + 1} Q ${lx} ${eyeY - eyeR} ${lx + eyeR} ${eyeY + 1}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>` +
                `<path d="M ${rx - eyeR} ${eyeY + 1} Q ${rx} ${eyeY - eyeR} ${rx + eyeR} ${eyeY + 1}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`
            );
        case "cool": {
            // Sunglasses bar
            const h = eyeR * 1.6;
            const w = eyeR * 2;
            return (
                `<rect x="${lx - w / 2}" y="${eyeY - h / 2}" width="${w}" height="${h}" rx="1" fill="${STROKE}"/>` +
                `<rect x="${rx - w / 2}" y="${eyeY - h / 2}" width="${w}" height="${h}" rx="1" fill="${STROKE}"/>` +
                `<line x1="${lx + w / 2}" y1="${eyeY}" x2="${rx - w / 2}" y2="${eyeY}" stroke="${STROKE}" stroke-width="2.2"/>`
            );
        }
        case "wink":
            return (
                `<path d="M ${lx - eyeR} ${eyeY} Q ${lx} ${eyeY - eyeR * 0.6} ${lx + eyeR} ${eyeY}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>` +
                `<circle cx="${rx}" cy="${eyeY}" r="${eyeR}" fill="${STROKE}"/>`
            );
        case "love":
            // Heart eyes
            return heartEye(lx, eyeY, eyeR * 1.4) + heartEye(rx, eyeY, eyeR * 1.4);
        case "sleepy":
            return (
                `<line x1="${lx - eyeR}" y1="${eyeY}" x2="${lx + eyeR}" y2="${eyeY}" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>` +
                `<line x1="${rx - eyeR}" y1="${eyeY}" x2="${rx + eyeR}" y2="${eyeY}" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`
            );
    }
}

function heartEye(cx: number, cy: number, size: number): string {
    const s = size;
    return (
        `<path d="M ${cx} ${cy + s * 0.25} ` +
        `C ${cx - s * 0.6} ${cy - s * 0.15} ${cx - s * 0.6} ${cy - s * 0.75} ${cx} ${cy - s * 0.3} ` +
        `C ${cx + s * 0.6} ${cy - s * 0.75} ${cx + s * 0.6} ${cy - s * 0.15} ${cx} ${cy + s * 0.25} Z" ` +
        `fill="#E74C3C"/>`
    );
}

// ─── Mouth ───────────────────────────────────────────────────────────────

function drawMouth(expression: Expression, g: EmojiGeo): string {
    const { cx, mouthY, r } = g;
    const mw = r * 0.68;

    switch (expression) {
        case "happy":
        case "wink":
        case "cool":
            return `<path d="M ${cx - mw / 2} ${mouthY} Q ${cx} ${mouthY + mw * 0.5} ${cx + mw / 2} ${mouthY}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`;
        case "laughing":
            return (
                `<path d="M ${cx - mw / 2} ${mouthY} Q ${cx} ${mouthY + mw * 0.9} ${cx + mw / 2} ${mouthY} Z" fill="${STROKE}"/>` +
                `<path d="M ${cx - mw / 2 + 2} ${mouthY + 1} Q ${cx} ${mouthY + mw * 0.7} ${cx + mw / 2 - 2} ${mouthY + 1}" fill="#E74C3C"/>`
            );
        case "love":
            return `<path d="M ${cx - mw / 2} ${mouthY} Q ${cx} ${mouthY + mw * 0.6} ${cx + mw / 2} ${mouthY}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`;
        case "neutral":
            return `<line x1="${cx - mw / 2}" y1="${mouthY}" x2="${cx + mw / 2}" y2="${mouthY}" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`;
        case "sad":
            return `<path d="M ${cx - mw / 2} ${mouthY + mw * 0.3} Q ${cx} ${mouthY - mw * 0.2} ${cx + mw / 2} ${mouthY + mw * 0.3}" fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`;
        case "angry":
            return `<path d="M ${cx - mw / 2} ${mouthY + mw * 0.2} Q ${cx} ${mouthY - mw * 0.1} ${cx + mw / 2} ${mouthY + mw * 0.2}" fill="none" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>`;
        case "surprised":
            return `<ellipse cx="${cx}" cy="${mouthY + 1}" rx="${mw * 0.28}" ry="${mw * 0.38}" fill="${STROKE}"/>`;
        case "sleepy":
            return `<path d="M ${cx - mw * 0.3} ${mouthY} Q ${cx} ${mouthY + mw * 0.25} ${cx + mw * 0.3} ${mouthY}" fill="none" stroke="${STROKE}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
}

// ─── Extras (expression-specific accents) ────────────────────────────────

function drawExtras(expression: Expression, g: EmojiGeo): string {
    const { cx, cy, r } = g;

    switch (expression) {
        case "angry": {
            // Eyebrow slashes above the eyes.
            const browY = g.eyeY - g.eyeR * 2;
            const lx = cx - g.eyeSpacing;
            const rx = cx + g.eyeSpacing;
            return (
                `<line x1="${lx - g.eyeR * 1.2}" y1="${browY - 1}" x2="${lx + g.eyeR * 1.2}" y2="${browY + 2}" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>` +
                `<line x1="${rx - g.eyeR * 1.2}" y1="${browY + 2}" x2="${rx + g.eyeR * 1.2}" y2="${browY - 1}" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round"/>`
            );
        }
        case "love": {
            // Tiny blush patches
            const blushY = cy + r * 0.2;
            return (
                `<circle cx="${cx - r * 0.55}" cy="${blushY}" r="${r * 0.08}" fill="${BLUSH}" opacity="0.4"/>` +
                `<circle cx="${cx + r * 0.55}" cy="${blushY}" r="${r * 0.08}" fill="${BLUSH}" opacity="0.4"/>`
            );
        }
        case "sad": {
            // Single teardrop under one eye
            const tx = cx - g.eyeSpacing;
            const ty = g.eyeY + g.eyeR * 2;
            return `<path d="M ${tx} ${ty} Q ${tx - 3} ${ty + 5} ${tx} ${ty + 8} Q ${tx + 3} ${ty + 5} ${tx} ${ty} Z" fill="${TEAR}"/>`;
        }
        case "sleepy": {
            // Small "Z" near forehead
            const zx = cx + r * 0.55;
            const zy = cy - r * 0.55;
            const z = r * 0.11;
            return `<path d="M ${zx} ${zy} h ${z * 2} l ${-z * 2} ${z * 2} h ${z * 2}" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        default:
            return "";
    }
}

// ─── Assembly ────────────────────────────────────────────────────────────

function createEmojiContent(options: EmojiOptions): string {
    const size = CANVAS;
    const random = createRandom(options.seed);
    const expression: Expression = options.expression ?? random.pick(EXPRESSIONS);
    const faceColor = options.faceColor ?? random.pick(FACE_COLORS);
    const g = computeGeo(size);

    let content = "";
    // A darker disc under the face reads as a soft shadow along its lower edge,
    // without the dark outline that turned to a heavy ring at small sizes.
    content += `<circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="#000" fill-opacity="0.16"/>`;
    content += `<circle cx="${g.cx}" cy="${g.cy - 1.2}" r="${g.r - 0.6}" fill="${faceColor}"/>`;
    content += layerGroup("eyes", drawEyes(expression, g), options);
    content += drawMouth(expression, g);
    content += drawExtras(expression, g);

    return content;
}

/**
 * Emoji avatar style
 *
 * Renders a round yellow face with one of ten expressions: happy, laughing,
 * cool, wink, love, sad, angry, surprised, sleepy, or neutral. The expression
 * is picked from the seed unless `options.expression` is set.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { emoji } from '@avatar-generator/style-emoji';
 *
 * const avatar = createAvatar(emoji, { seed: 'Hugo GB' });
 * ```
 */
export const emoji: Style<EmojiOptions> = {
    name: "emoji",

    create(options: EmojiOptions): AvatarResult {
        validateOption("emoji", "expression", options.expression, EXPRESSIONS);

        const random = createRandom(`${options.seed}:background`);
        const palette = options.colors ?? BACKGROUNDS;
        const backgroundColor = random.pick(palette);

        const content = createEmojiContent(options);
        return buildSvg(content, options, backgroundColor, { canvas: CANVAS });
    },
};

export default emoji;
