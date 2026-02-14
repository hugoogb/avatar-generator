import type { AvatarResult, GeometricOptions, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, DEFAULT_COLORS } from "@avatar-generator/core";

type ShapeType = "circle" | "square" | "triangle" | "diamond";

/**
 * Draws a shape at the given position
 */
function drawShape(
  type: ShapeType,
  x: number,
  y: number,
  cellSize: number,
  color: string
): string {
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const r = cellSize * 0.4;

  switch (type) {
    case "circle":
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;

    case "square":
      const offset = cellSize * 0.1;
      const size = cellSize * 0.8;
      return `<rect x="${x + offset}" y="${y + offset}" width="${size}" height="${size}" fill="${color}"/>`;

    case "triangle":
      const points = [
        `${cx},${cy - r}`,
        `${cx - r},${cy + r * 0.7}`,
        `${cx + r},${cy + r * 0.7}`,
      ].join(" ");
      return `<polygon points="${points}" fill="${color}"/>`;

    case "diamond":
      const dPoints = [
        `${cx},${cy - r}`,
        `${cx + r},${cy}`,
        `${cx},${cy + r}`,
        `${cx - r},${cy}`,
      ].join(" ");
      return `<polygon points="${dPoints}" fill="${color}"/>`;
  }
}

/**
 * Creates geometric style avatar content
 */
function createGeometricContent(options: GeometricOptions): string {
  const size = options.size ?? 64;
  const gridSize = options.gridSize ?? 4;
  const colors = options.colors ?? DEFAULT_COLORS;
  const random = createRandom(options.seed);

  const cellSize = size / gridSize;
  const shapes: ShapeType[] = ["circle", "square", "triangle", "diamond"];
  let content = "";

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Randomly decide if this cell should have a shape
      if (random.bool(0.7)) {
        const shape = random.pick(shapes);
        const color = random.pick(colors);
        const x = col * cellSize;
        const y = row * cellSize;
        content += drawShape(shape, x, y, cellSize, color);
      }
    }
  }

  return content;
}

/**
 * Geometric avatar style
 *
 * Creates avatars with a grid of geometric shapes (circles, squares, triangles, diamonds).
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { geometric } from '@avatar-generator/style-geometric';
 *
 * const avatar = createAvatar(geometric, {
 *   seed: 'unique-id',
 *   size: 64,
 *   gridSize: 4,
 * });
 * ```
 */
export const geometric: Style<GeometricOptions> = {
  name: "geometric",

  create(options: GeometricOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createGeometricContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default geometric;
export type { GeometricOptions };
