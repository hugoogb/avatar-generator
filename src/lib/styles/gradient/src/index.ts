import type { AvatarOptions, AvatarResult, Random, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, validateOption } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type GradientDirection = "linear" | "radial" | "diagonal";

export type GradientPattern = "none" | "dots" | "stripes" | "waves" | "grid";

export interface GradientOptions extends AvatarOptions {
    /** Override gradient direction */
    direction?: GradientDirection;
    /** Override the pattern overlay */
    pattern?: GradientPattern;
    /** Number of color stops in the gradient (2 or 3, default 2) */
    colorStops?: number;
}

/** All valid gradient directions */
export const DIRECTIONS: GradientDirection[] = ["linear", "radial", "diagonal"];

/** All valid pattern overlays */
export const PATTERNS: GradientPattern[] = ["none", "dots", "stripes", "waves", "grid"];

/** Drawn in this coordinate space and scaled, so pattern weights stay in proportion. */
const CANVAS = 64;

// Curated, because two colours picked at random usually meet in mud. Each runs
// between neighbouring hues, and the middle stop is only used with `colorStops: 3`.
const GRADIENTS: [string, string, string][] = [
    ["#FF6B9D", "#C644FC", "#5A17EE"],
    ["#5A17EE", "#2196F3", "#00BCD4"],
    ["#00BCD4", "#00C9A7", "#7BE495"],
    ["#FF9800", "#FF5722", "#E91E63"],
    ["#FFD54F", "#FF9800", "#FF5722"],
    ["#E91E63", "#9C27B0", "#3F51B5"],
    ["#3F51B5", "#2196F3", "#4FC3F7"],
    ["#F48FB1", "#FF8A65", "#FFD54F"],
    ["#7C4DFF", "#E040FB", "#FF6B9D"],
    ["#00897B", "#00BCD4", "#4FC3F7"],
    ["#1E3C72", "#2A5298", "#4FC3F7"],
    ["#FF5F6D", "#FF8A65", "#FFC371"],
];

// ============================================================================
// Gradient defs
// ============================================================================

function gradientDefs(id: string, direction: GradientDirection, stops: string[]): string {
    const stopTags = stops
        .map((color, i) => {
            const offset = stops.length === 1 ? 100 : Math.round((i / (stops.length - 1)) * 100);
            return `<stop offset="${offset}%" stop-color="${color}"/>`;
        })
        .join("");

    switch (direction) {
        case "linear":
            return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stopTags}</linearGradient>`;
        case "diagonal":
            return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stopTags}</linearGradient>`;
        case "radial":
            return `<radialGradient id="${id}" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">${stopTags}</radialGradient>`;
    }
}

// ============================================================================
// Pattern overlays — subtle semi-transparent decoration on top of gradient
// ============================================================================

function patternOverlay(pattern: GradientPattern, size: number, random: Random): string {
    if (pattern === "none") return "";

    const overlayColor = "rgba(255,255,255,0.16)";
    const strokeColor = "rgba(255,255,255,0.16)";

    switch (pattern) {
        case "dots": {
            const step = size / 6;
            const r = step * 0.15;
            let dots = "";
            for (let y = step / 2; y < size; y += step) {
                for (let x = step / 2; x < size; x += step) {
                    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${overlayColor}"/>`;
                }
            }
            return dots;
        }
        case "stripes": {
            const angle = random.pick([0, 45, 90, 135]);
            const spacing = size / 10;
            let stripes = "";
            for (let i = -size; i < size * 2; i += spacing) {
                stripes += `<line x1="${i}" y1="0" x2="${i}" y2="${size}" stroke="${strokeColor}" stroke-width="${spacing * 0.25}"/>`;
            }
            return `<g transform="rotate(${angle} ${size / 2} ${size / 2})">${stripes}</g>`;
        }
        case "waves": {
            const waveCount = 4;
            let waves = "";
            for (let i = 1; i < waveCount; i++) {
                const y = (size / waveCount) * i;
                const amp = size * 0.05;
                waves += `<path d="M 0 ${y} Q ${size / 4} ${y - amp} ${size / 2} ${y} T ${size} ${y}" fill="none" stroke="${strokeColor}" stroke-width="1.5"/>`;
            }
            return waves;
        }
        case "grid": {
            const step = size / 6;
            let grid = "";
            for (let i = step; i < size; i += step) {
                grid += `<line x1="${i}" y1="0" x2="${i}" y2="${size}" stroke="${strokeColor}" stroke-width="0.8"/>`;
                grid += `<line x1="0" y1="${i}" x2="${size}" y2="${i}" stroke="${strokeColor}" stroke-width="0.8"/>`;
            }
            return grid;
        }
    }
}

/**
 * Gradient avatar style
 *
 * Produces smooth color gradients (linear, diagonal, or radial) with optional
 * pattern overlays (dots, stripes, waves, grid). Direction, pattern, and stop
 * count are seed-derived unless overridden.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { gradient } from '@avatar-generator/style-gradient';
 *
 * const avatar = createAvatar(gradient, { seed: 'Hugo GB' });
 * ```
 */
export const gradient: Style<GradientOptions> = {
    name: "gradient",

    create(options: GradientOptions): AvatarResult {
        validateOption("gradient", "direction", options.direction, DIRECTIONS);
        validateOption("gradient", "pattern", options.pattern, PATTERNS);

        const size = CANVAS;
        const random = createRandom(options.seed);
        const direction: GradientDirection = options.direction ?? random.pick(DIRECTIONS);
        const pattern: GradientPattern = options.pattern ?? random.pick(PATTERNS);
        const stopCount = options.colorStops === 3 ? 3 : 2;

        const curated = random.pick(GRADIENTS);
        let stops: string[];
        if (options.colors && options.colors.length > 0) {
            // A shuffled copy gives distinct stops whenever the palette has them.
            const shuffled = random.shuffle([...options.colors]);
            stops = Array.from({ length: stopCount }, (_, i) => shuffled[i % shuffled.length]);
        } else {
            stops = stopCount === 3 ? curated : [curated[0], curated[2]];
        }

        // Embed the gradient definitions inline in the content. SVG allows
        // additional <defs> blocks, so buildSvg's own clip path coexists with ours.
        const key = `${direction}-${stops.join("-").replace(/[^a-zA-Z0-9-]/g, "")}`;
        const gradId = `g-${key}`;
        const glowId = `glow-${key}`;
        const glow =
            `<radialGradient id="${glowId}" cx="30%" cy="25%" r="75%">` +
            `<stop offset="0%" stop-color="#fff" stop-opacity="0.3"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>` +
            `</radialGradient>`;
        const localDefs = `<defs>${gradientDefs(gradId, direction, stops)}${glow}</defs>`;
        const gradientFill = `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#${gradId})"/>`;
        // A soft light in one corner gives the flat gradient some depth.
        const glowFill = `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#${glowId})"/>`;
        const overlay = patternOverlay(pattern, size, random);

        // buildSvg's background is painted over by the gradient, and for a
        // transparent avatar it skips it altogether.
        const content = localDefs + gradientFill + glowFill + overlay;
        return buildSvg(content, options, stops[0], { canvas: CANVAS });
    },
};

export default gradient;
