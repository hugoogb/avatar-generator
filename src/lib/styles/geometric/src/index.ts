import type { AvatarOptions, AvatarResult, Style } from "@avatar-generator/core";
import {
    buildSvg,
    contrastRatio,
    createRandom,
    DEFAULT_COLORS,
    pickContrasting,
    readableColor,
    resolveTheme,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export interface GeometricOptions extends AvatarOptions {
    /** Grid size (default: 5, odd recommended) */
    gridSize?: number;
    /** Padding cells around the pattern (default: 1.5, which keeps its corners inside a circle) */
    padding?: number;
    /** Override foreground color (otherwise picked from palette) */
    foregroundColor?: string;
}

/**
 * Creates identicon-style avatar content using a 5x5 symmetrical grid
 */
function createIdenticonContent(options: GeometricOptions, foreground: string): string {
    const size = options.size ?? 64;
    const gridSize = options.gridSize ?? 5;
    const padding = options.padding ?? 1.5;
    const random = createRandom(options.seed);

    const cellSize = size / (gridSize + padding * 2);
    const offsetX = padding * cellSize;
    const offsetY = padding * cellSize;

    // Generate left half + center column (ceil to include center for odd grids)
    const halfCols = Math.ceil(gridSize / 2);
    const grid: boolean[][] = [];
    let filledCount = 0;

    for (let row = 0; row < gridSize; row++) {
        grid[row] = [];
        for (let col = 0; col < halfCols; col++) {
            const filled = random.bool(0.5);
            grid[row][col] = filled;
            if (filled) {
                // Count actual cells (center column counts once, others count twice for mirror)
                const isCenter = gridSize % 2 === 1 && col === halfCols - 1;
                filledCount += isCenter ? 1 : 2;
            }
        }
    }

    // Guarantee minimum 3 filled cells
    if (filledCount < 3) {
        // Fill center cells to reach minimum
        const centerHalf = gridSize % 2 === 1 ? halfCols - 1 : halfCols - 1;
        for (let row = 0; row < gridSize && filledCount < 3; row++) {
            if (!grid[row][centerHalf]) {
                grid[row][centerHalf] = true;
                const isCenter = gridSize % 2 === 1 && centerHalf === halfCols - 1;
                filledCount += isCenter ? 1 : 2;
            }
        }
        // If still not enough, fill from top-left
        for (let row = 0; row < gridSize && filledCount < 3; row++) {
            for (let col = 0; col < halfCols && filledCount < 3; col++) {
                if (!grid[row][col]) {
                    grid[row][col] = true;
                    const isCenter = gridSize % 2 === 1 && col === halfCols - 1;
                    filledCount += isCenter ? 1 : 2;
                }
            }
        }
    }

    // Build SVG rects with bilateral symmetry
    let content = "";

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Determine source column (mirror right side to left)
            const sourceCol = col < halfCols ? col : gridSize - 1 - col;

            if (grid[row][sourceCol]) {
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;
                content += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${foreground}"/>`;
            }
        }
    }

    // Abutting cells must not show hairline seams when antialiased.
    return `<g shape-rendering="crispEdges">${content}</g>`;
}

/**
 * Geometric avatar style (Identicon)
 *
 * Creates GitHub-style identicon avatars with a symmetrical grid pattern.
 * Uses bilateral symmetry and two colors for recognizable, unique patterns.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { geometric } from '@avatar-generator/style-geometric';
 *
 * const avatar = createAvatar(geometric, {
 *   seed: 'unique-id',
 *   size: 64,
 *   gridSize: 5,
 * });
 * ```
 */
export const geometric: Style<GeometricOptions> = {
    name: "geometric",

    create(options: GeometricOptions): AvatarResult {
        const random = createRandom(`${options.seed}:colors`);
        const colors = options.colors ?? DEFAULT_COLORS;
        const backgroundColor = random.pick(colors);

        // Always drawn, so the pattern is the same in every theme and palette.
        const picked = pickContrasting(random, colors, backgroundColor);
        // With no background, the page behind could be any colour. The palette's
        // mid-tones hold up on both light and dark, where black or white would vanish.
        const contrasting = options.transparent
            ? backgroundColor
            : contrastRatio(picked, backgroundColor) >= 3
              ? picked
              : readableColor(backgroundColor);
        const foreground = options.foregroundColor ?? resolveTheme(options.theme)?.foreground ?? contrasting;

        const content = createIdenticonContent(options, foreground);

        return buildSvg(content, options, backgroundColor);
    },
};

export default geometric;
