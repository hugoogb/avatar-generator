import type { AvatarResult, GeometricOptions, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, DEFAULT_COLORS } from "@avatar-generator/core";

/**
 * Creates identicon-style avatar content using a 5x5 symmetrical grid
 */
function createIdenticonContent(options: GeometricOptions, foreground: string): string {
  const size = options.size ?? 64;
  const gridSize = options.gridSize ?? 5;
  const padding = options.padding ?? 1;
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
    const centerCol = Math.floor(gridSize / 2);
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

  return content;
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
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    // Pick foreground color, ensuring it differs from background
    let foreground = options.foregroundColor ?? random.pick(colors);
    if (foreground === backgroundColor && !options.foregroundColor) {
      // Shift to next color in palette
      const idx = colors.indexOf(foreground);
      foreground = colors[(idx + 1) % colors.length];
    }

    const content = createIdenticonContent(options, foreground);

    return buildSvg(content, options, backgroundColor);
  },
};

export default geometric;
export type { GeometricOptions };
