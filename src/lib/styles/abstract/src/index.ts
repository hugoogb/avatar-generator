import type { AvatarOptions, AvatarResult, Random, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, validateOption } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type AbstractComposition = "mondrian" | "kandinsky" | "bauhaus";

export interface AbstractOptions extends AvatarOptions {
    /** Override the composition style */
    composition?: AbstractComposition;
    /** Number of accent shapes drawn on top of the base blocks (default: 3) */
    shapeCount?: number;
}

// ─── Emoji style option unions ────────────────────────────────────────────

type Composition = AbstractComposition;

/** All valid composition values for the abstract style */
export const COMPOSITIONS: Composition[] = ["mondrian", "kandinsky", "bauhaus"];

// Mondrian uses strict primary palette (plus white and black).
const MONDRIAN_COLORS = ["#D40000", "#FFDE00", "#0051BA", "#FFFFFF"];
const MONDRIAN_DIVIDER = "#111111";

// Kandinsky/Bauhaus use bolder saturated palettes.
const BOLD_COLORS = ["#E63946", "#F1C40F", "#2A9D8F", "#264653", "#F4A261", "#6C5CE7", "#0984E3"];

// ============================================================================
// Mondrian composition — axis-aligned rectangles with thick black dividers.
// ============================================================================

function drawMondrian(size: number, random: Random): string {
    const divider = 3;
    // Vertical splits (1–2 columns of sub-rects) and horizontal splits per band.
    const vSplits = [random.int(Math.floor(size * 0.35), Math.floor(size * 0.55))];
    if (random.bool(0.4)) {
        vSplits.push(random.int(Math.floor(size * 0.65), Math.floor(size * 0.82)));
    }
    vSplits.sort((a, b) => a - b);

    const xs = [0, ...vSplits, size];
    let content = "";

    for (let i = 0; i < xs.length - 1; i++) {
        const left = xs[i];
        const right = xs[i + 1];
        const width = right - left;

        // Per column, split vertically into 1–3 rectangles.
        const bands = random.pick([1, 2, 2, 3]);
        const hSplits: number[] = [];
        for (let b = 1; b < bands; b++) {
            hSplits.push(random.int(Math.floor(size * 0.25), Math.floor(size * 0.75)));
        }
        hSplits.sort((a, b) => a - b);
        const ys = [0, ...hSplits, size];

        for (let j = 0; j < ys.length - 1; j++) {
            const top = ys[j];
            const height = ys[j + 1] - top;
            const color = random.pick(MONDRIAN_COLORS);
            content += `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="${color}"/>`;
        }
    }

    // Draw the divider grid on top.
    for (const x of vSplits) {
        content += `<rect x="${x - divider / 2}" y="0" width="${divider}" height="${size}" fill="${MONDRIAN_DIVIDER}"/>`;
    }
    // Horizontal dividers are per-column; approximate them with a thin grid across the full canvas.
    const hDividerCount = random.int(2, 4);
    const used = new Set<number>();
    for (let i = 0; i < hDividerCount; i++) {
        const y = random.int(Math.floor(size * 0.2), Math.floor(size * 0.8));
        if (!used.has(y)) {
            used.add(y);
            content += `<rect x="0" y="${y - divider / 2}" width="${size}" height="${divider}" fill="${MONDRIAN_DIVIDER}"/>`;
        }
    }

    return content;
}

// ============================================================================
// Kandinsky composition — organic circles, triangles, and radiating lines.
// ============================================================================

function drawKandinsky(size: number, random: Random, shapeCount: number): string {
    const cx = size / 2;
    const cy = size / 2;
    let content = "";

    // Backdrop arcs radiating from a corner.
    const originX = random.pick([0, size]);
    const originY = random.pick([0, size]);
    for (let i = 0; i < 3; i++) {
        const r = size * (0.35 + i * 0.22);
        const color = random.pick(BOLD_COLORS);
        content += `<circle cx="${originX}" cy="${originY}" r="${r}" fill="none" stroke="${color}" stroke-width="${random.int(2, 4)}" opacity="0.6"/>`;
    }

    // Central grouping of concentric circles (Kandinsky "Several Circles").
    const centralR = size * 0.22;
    const ringColor = random.pick(BOLD_COLORS);
    content += `<circle cx="${cx}" cy="${cy}" r="${centralR}" fill="${ringColor}"/>`;
    content += `<circle cx="${cx}" cy="${cy}" r="${centralR * 0.6}" fill="${random.pick(BOLD_COLORS)}"/>`;
    content += `<circle cx="${cx}" cy="${cy}" r="${centralR * 0.3}" fill="${random.pick(BOLD_COLORS)}"/>`;

    // Accent shapes scattered on the canvas.
    for (let i = 0; i < shapeCount; i++) {
        const x = random.int(Math.floor(size * 0.1), Math.floor(size * 0.9));
        const y = random.int(Math.floor(size * 0.1), Math.floor(size * 0.9));
        const color = random.pick(BOLD_COLORS);
        const kind = random.pick(["triangle", "circle", "line"] as const);

        if (kind === "triangle") {
            const s = random.int(Math.floor(size * 0.08), Math.floor(size * 0.18));
            content += `<polygon points="${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}" fill="${color}"/>`;
        } else if (kind === "circle") {
            const r = random.int(Math.floor(size * 0.04), Math.floor(size * 0.1));
            content += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
        } else {
            const len = random.int(Math.floor(size * 0.15), Math.floor(size * 0.35));
            const angle = random.int(0, 180);
            const rad = (angle * Math.PI) / 180;
            const x2 = x + Math.cos(rad) * len;
            const y2 = y + Math.sin(rad) * len;
            content += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
        }
    }

    return content;
}

// ============================================================================
// Bauhaus composition — half-circles, squares, and bold diagonals.
// ============================================================================

function drawBauhaus(size: number, random: Random): string {
    // Divide canvas into a 2x2 grid where each cell gets one primitive.
    const cell = size / 2;
    let content = "";

    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            const x = col * cell;
            const y = row * cell;
            const fillBg = random.pick(BOLD_COLORS);
            const fill = random.pick(BOLD_COLORS.filter((c) => c !== fillBg));

            content += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${fillBg}"/>`;

            const kind = random.pick([
                "half-top",
                "half-bottom",
                "half-left",
                "half-right",
                "triangle",
                "circle",
            ] as const);
            switch (kind) {
                case "half-top":
                    content += `<path d="M ${x} ${y + cell} A ${cell / 2} ${cell / 2} 0 0 1 ${x + cell} ${y + cell} Z" fill="${fill}"/>`;
                    break;
                case "half-bottom":
                    content += `<path d="M ${x} ${y} A ${cell / 2} ${cell / 2} 0 0 0 ${x + cell} ${y} Z" fill="${fill}"/>`;
                    break;
                case "half-left":
                    content += `<path d="M ${x + cell} ${y} A ${cell / 2} ${cell / 2} 0 0 0 ${x + cell} ${y + cell} Z" fill="${fill}"/>`;
                    break;
                case "half-right":
                    content += `<path d="M ${x} ${y} A ${cell / 2} ${cell / 2} 0 0 1 ${x} ${y + cell} Z" fill="${fill}"/>`;
                    break;
                case "triangle":
                    content += `<polygon points="${x},${y} ${x + cell},${y} ${x},${y + cell}" fill="${fill}"/>`;
                    break;
                case "circle":
                    content += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.35}" fill="${fill}"/>`;
                    break;
            }
        }
    }

    return content;
}

// ============================================================================
// Style assembly
// ============================================================================

function createAbstractContent(options: AbstractOptions): string {
    const size = options.size ?? 64;
    const random = createRandom(options.seed);
    const composition: Composition = options.composition ?? random.pick(COMPOSITIONS);
    const shapeCount = options.shapeCount ?? 3;

    switch (composition) {
        case "mondrian":
            return drawMondrian(size, random);
        case "kandinsky":
            return drawKandinsky(size, random, shapeCount);
        case "bauhaus":
            return drawBauhaus(size, random);
    }
}

/**
 * Abstract avatar style
 *
 * Generates avatars inspired by early-modernist abstract art: Mondrian grids,
 * Kandinsky concentric circles and radiating lines, and Bauhaus half-circles
 * and bold shapes. The composition is picked from the seed unless
 * `options.composition` is set.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { abstract } from '@avatar-generator/style-abstract';
 *
 * const avatar = createAvatar(abstract, { seed: 'Hugo GB' });
 * ```
 */
export const abstract: Style<AbstractOptions> = {
    name: "abstract",

    create(options: AbstractOptions): AvatarResult {
        validateOption("abstract", "composition", options.composition, COMPOSITIONS);

        const random = createRandom(options.seed);
        // The composition draws over the full canvas, but we still honor
        // `options.colors` for the underlying background so transparent and
        // custom-palette tests behave consistently across styles.
        const palette = options.colors ?? BOLD_COLORS;
        const backgroundColor = random.pick(palette);

        const content = createAbstractContent(options);

        return buildSvg(content, options, backgroundColor);
    },
};

export default abstract;
