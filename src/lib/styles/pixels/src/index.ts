import type { Style, PixelsOptions, AvatarResult } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, buildSvg } from "@avatar-generator/core";

/**
 * Creates pixel art style avatar content
 */
function createPixelsContent(options: PixelsOptions): string {
  const size = options.size ?? 64;
  const pixelSize = options.pixelSize ?? 8;
  const mirror = options.mirror ?? true;
  const colors = options.colors ?? DEFAULT_COLORS;
  const random = createRandom(options.seed);

  const cellSize = size / pixelSize;
  // For mirrored, only generate half the columns
  const colsToGenerate = mirror ? Math.ceil(pixelSize / 2) : pixelSize;

  // Generate the pixel grid
  const grid: (string | null)[][] = [];
  for (let row = 0; row < pixelSize; row++) {
    grid[row] = [];
    for (let col = 0; col < colsToGenerate; col++) {
      // Higher probability in the center for more interesting patterns
      const distFromCenter = Math.abs(col - colsToGenerate / 2) / colsToGenerate;
      const probability = 0.5 + (1 - distFromCenter) * 0.3;

      if (random.bool(probability)) {
        grid[row][col] = random.pick(colors);
      } else {
        grid[row][col] = null;
      }
    }
  }

  // Build SVG content
  let content = "";

  for (let row = 0; row < pixelSize; row++) {
    for (let col = 0; col < pixelSize; col++) {
      // For mirrored display, determine the source column
      let sourceCol: number;
      if (mirror && col >= colsToGenerate) {
        sourceCol = pixelSize - 1 - col;
      } else {
        sourceCol = col;
      }

      const color = grid[row][sourceCol];
      if (color) {
        const x = col * cellSize;
        const y = row * cellSize;
        content += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
      }
    }
  }

  return content;
}

/**
 * Pixels avatar style
 *
 * Creates retro pixel art style avatars with optional horizontal symmetry.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { pixels } from '@avatar-generator/style-pixels';
 *
 * const avatar = createAvatar(pixels, {
 *   seed: 'unique-id',
 *   size: 64,
 *   pixelSize: 8,
 *   mirror: true,
 * });
 * ```
 */
export const pixels: Style<PixelsOptions> = {
  name: "pixels",

  create(options: PixelsOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createPixelsContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default pixels;
export type { PixelsOptions };
