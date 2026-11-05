import type { AvatarOptions, AvatarResult, Random, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, DEFAULT_COLORS, pickContrasting, validateOption } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type RingsCenterStyle = "solid" | "dot" | "ring" | "diamond" | "none";

export interface RingsOptions extends AvatarOptions {
    /** Number of rings (default: 3) */
    ringCount?: number;
    /** Gap between rings, on a 64-unit canvas (default: 2) */
    ringGap?: number;
    /** Allow segmented rings (default: true) */
    segmented?: boolean;
    /** Allow dashed rings (default: true) */
    dashed?: boolean;
    /** Center decoration style (default: "solid") */
    centerStyle?: RingsCenterStyle;
}

// ─── Faces style option unions ────────────────────────────────────────────

type RingType = "solid" | "segmented" | "dashed";

/** All valid center decoration values for the rings style */
export const CENTER_STYLES: RingsCenterStyle[] = ["solid", "dot", "ring", "diamond", "none"];

/**
 * Creates an SVG arc path segment between two angles on a ring
 */
function arcSegment(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number,
    color: string,
): string {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const cos = Math.cos;
    const sin = Math.sin;

    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    // Outer arc (clockwise)
    const ox1 = cx + outerR * cos(startRad);
    const oy1 = cy + outerR * sin(startRad);
    const ox2 = cx + outerR * cos(endRad);
    const oy2 = cy + outerR * sin(endRad);

    // Inner arc (counter-clockwise)
    const ix1 = cx + innerR * cos(endRad);
    const iy1 = cy + innerR * sin(endRad);
    const ix2 = cx + innerR * cos(startRad);
    const iy2 = cy + innerR * sin(startRad);

    return `<path d="M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z" fill="${color}"/>`;
}

/**
 * Draws a segmented ring with alternating colors
 */
/** Drawn in this coordinate space and scaled, so gaps stay in proportion. */
const CANVAS = 64;
/** Keeps the outer ring off the avatar's edge, where a clip would cut it. */
const EDGE_INSET = 4;

function drawSegmentedRing(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    random: Random,
    color1: string,
    color2: string,
): string {
    const segments = random.pick([2, 4]);
    const rotationOffset = random.int(0, 360);
    const angleStep = 360 / segments;
    let content = "";

    for (let i = 0; i < segments; i++) {
        const start = rotationOffset + i * angleStep;
        content += arcSegment(cx, cy, innerR, outerR, start, start + angleStep, i % 2 === 0 ? color1 : color2);
    }

    return content;
}

function drawDashedRing(cx: number, cy: number, innerR: number, outerR: number, random: Random, color: string): string {
    const dashes = random.pick([6, 8]);
    const angleStep = 360 / dashes;
    const dashAngle = angleStep * 0.6; // 60% dash, 40% gap
    let content = "";

    for (let i = 0; i < dashes; i++) {
        const start = i * angleStep;
        content += arcSegment(cx, cy, innerR, outerR, start, start + dashAngle, color);
    }

    return content;
}

function drawCenterDecoration(cx: number, cy: number, radius: number, style: string, color: string): string {
    switch (style) {
        case "dot":
            return `<circle cx="${cx}" cy="${cy}" r="${radius * 0.5}" fill="${color}"/>`;
        case "ring":
            return `<circle cx="${cx}" cy="${cy}" r="${radius * 0.7}" fill="none" stroke="${color}" stroke-width="${radius * 0.5}"/>`;
        case "diamond": {
            const d = radius * 0.95;
            return `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${color}"/>`;
        }
        case "none":
            return "";
        default: // "solid"
            return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}"/>`;
    }
}

function createRingsContent(options: RingsOptions, backgroundColor: string): string {
    const ringCount = Math.max(options.ringCount ?? 3, 1);
    const ringGap = options.ringGap ?? 2;
    const allowSegmented = options.segmented !== false;
    const allowDashed = options.dashed !== false;
    const centerStyle = options.centerStyle ?? "solid";
    const random = createRandom(options.seed);

    // A few colours per avatar. One for each ring read as noise at small sizes.
    const source = options.colors ?? [...DEFAULT_COLORS, "#FFFFFF"];
    const others = source.filter((color) => color !== backgroundColor);
    const palette = random.shuffle(others.length > 0 ? others : [...source]).slice(0, 3);

    const center = CANVAS / 2;
    const maxRadius = center - EDGE_INSET;

    // The rings and the centre share the radius evenly, less the gaps between them.
    const ringWidth = Math.max((maxRadius - ringGap * ringCount) / (ringCount + 0.6), 1);

    const types: RingType[] = ["solid"];
    if (allowSegmented) types.push("segmented");
    if (allowDashed) types.push("dashed");

    let content = "";
    // Each colour stands out from the ring outside it, the first from the background.
    let previous = backgroundColor;
    let outerRadius = maxRadius;

    for (let i = 0; i < ringCount && outerRadius - ringWidth > 0; i++) {
        const innerRadius = outerRadius - ringWidth;
        const color = pickContrasting(random, palette, previous, 1.8);

        switch (random.pick(types)) {
            case "segmented": {
                const second = pickContrasting(random, palette, color, 1.5);
                content += drawSegmentedRing(center, center, innerRadius, outerRadius, random, color, second);
                break;
            }
            case "dashed":
                content += drawDashedRing(center, center, innerRadius, outerRadius, random, color);
                break;
            default:
                content += `<circle cx="${center}" cy="${center}" r="${(innerRadius + outerRadius) / 2}" fill="none" stroke="${color}" stroke-width="${ringWidth}"/>`;
        }

        previous = color;
        outerRadius = innerRadius - ringGap;
    }

    if (outerRadius > 0) {
        content += drawCenterDecoration(
            center,
            center,
            outerRadius,
            centerStyle,
            pickContrasting(random, palette, backgroundColor, 1.8),
        );
    }

    return content;
}

/**
 * Rings avatar style
 *
 * Creates avatars with colorful concentric rings. Rings can be solid,
 * segmented (pie slices), or dashed. The center can have various decorations.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { rings } from '@avatar-generator/style-rings';
 *
 * const avatar = createAvatar(rings, {
 *   seed: 'unique-id',
 *   size: 64,
 *   ringCount: 4,
 *   ringGap: 2,
 * });
 * ```
 */
export const rings: Style<RingsOptions> = {
    name: "rings",

    create(options: RingsOptions): AvatarResult {
        validateOption("rings", "centerStyle", options.centerStyle, CENTER_STYLES);

        const random = createRandom(`${options.seed}:background`);
        const colors = options.colors ?? DEFAULT_COLORS;
        const backgroundColor = random.pick(colors);

        const content = createRingsContent(options, backgroundColor);

        return buildSvg(content, options, backgroundColor, { canvas: CANVAS });
    },
};

export default rings;
