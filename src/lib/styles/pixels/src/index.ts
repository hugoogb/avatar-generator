import type { Style, PixelsOptions, AvatarResult } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, SKIN_TONES, buildSvg } from "@avatar-generator/core";

type HairStyle = "none" | "flat" | "spiky" | "side" | "mohawk" | "full";
type EyeStyle = "dot" | "wide" | "closed" | "wink";
type MouthStyle = "smile" | "neutral" | "open" | "smirk";

const HAIR_STYLES: HairStyle[] = ["none", "flat", "spiky", "side", "mohawk", "full"];
const EYE_STYLES: EyeStyle[] = ["dot", "wide", "closed", "wink"];
const MOUTH_STYLES: MouthStyle[] = ["smile", "neutral", "open", "smirk"];

/**
 * Returns pixel coordinates for a hair style (rows 0-1 area)
 */
function getHairPixels(style: HairStyle): [number, number][] {
  switch (style) {
    case "none":
      return [];
    case "flat":
      return [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[1,6]];
    case "spiky":
      return [[0,1],[0,3],[0,5],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6]];
    case "side":
      return [[0,1],[0,2],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,1]];
    case "mohawk":
      return [[0,3],[0,4],[1,3],[1,4]];
    case "full":
      return [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[1,2],[1,5],[1,6]];
  }
}

/**
 * Returns pixel coordinates for eye styles at row 3
 */
function getEyePixels(style: EyeStyle): [number, number][] {
  switch (style) {
    case "dot":
      return [[3,2],[3,5]];
    case "wide":
      return [[3,2],[3,3],[3,5],[3,4]];
    case "closed":
      return [[3,2],[3,5]];
    case "wink":
      return [[3,2],[3,5]];
  }
}

/**
 * Returns pixel coordinates for mouth styles at rows 5-6
 */
function getMouthPixels(style: MouthStyle): [number, number][] {
  switch (style) {
    case "smile":
      return [[5,2],[5,5],[6,3],[6,4]];
    case "neutral":
      return [[5,3],[5,4]];
    case "open":
      return [[5,3],[5,4],[6,3],[6,4]];
    case "smirk":
      return [[5,4],[5,5],[6,5]];
  }
}

/**
 * Creates pixel face avatar content on an 8x8 grid
 */
function createPixelFaceContent(options: PixelsOptions): string {
  const size = options.size ?? 64;
  const gridSize = options.pixelSize ?? 8;
  const skinTones = options.skinTones ?? SKIN_TONES;
  const random = createRandom(options.seed);

  const cellSize = size / gridSize;
  const skinColor = random.pick(skinTones);
  const colors = options.colors ?? DEFAULT_COLORS;
  const hairColor = random.pick(colors);
  const featureColor = options.featureColor ?? "#2C1810";

  const hairStyle = random.pick(HAIR_STYLES);
  const eyeStyle = random.pick(EYE_STYLES);
  const mouthStyle = random.pick(MOUTH_STYLES);
  const hasEyebrows = random.bool(0.4);
  const hasNose = random.bool(0.3);
  const hasAccessories = (options.accessories !== false) && random.bool(0.15);

  // Build pixel map: key = "row,col", value = color
  const pixelMap: Map<string, string> = new Map();

  // Head shape (rows 1-6, cols 1-6) with rounded corners
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 6; col++) {
      if ((row === 1 || row === 6) && (col === 1 || col === 6)) continue;
      pixelMap.set(`${row},${col}`, skinColor);
    }
  }

  // Hair
  for (const [row, col] of getHairPixels(hairStyle)) {
    pixelMap.set(`${row},${col}`, hairColor);
  }

  // Eyes
  for (const [row, col] of getEyePixels(eyeStyle)) {
    pixelMap.set(`${row},${col}`, featureColor);
  }

  // Eyebrows (row 2, above eyes)
  if (hasEyebrows) {
    pixelMap.set("2,2", featureColor);
    pixelMap.set("2,5", featureColor);
  }

  // Nose (row 4, center)
  if (hasNose) {
    pixelMap.set("4,3", featureColor);
  }

  // Mouth
  for (const [row, col] of getMouthPixels(mouthStyle)) {
    const mouthColor = mouthStyle === "open" && row === 6 ? "#8B0000" : featureColor;
    pixelMap.set(`${row},${col}`, mouthColor);
  }

  // Accessories (glasses bridge)
  if (hasAccessories) {
    pixelMap.set("3,3", featureColor);
    pixelMap.set("3,4", featureColor);
  }

  // Render all pixels as rects
  let content = "";
  for (const [key, color] of pixelMap) {
    const [row, col] = key.split(",").map(Number);
    const x = col * cellSize;
    const y = row * cellSize;
    content += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
  }

  return content;
}

/**
 * Pixels avatar style (Pixel Faces)
 *
 * Creates 8-bit retro pixel face avatars with eyes, mouth, hair, and optional accessories.
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
 * });
 * ```
 */
export const pixels: Style<PixelsOptions> = {
  name: "pixels",

  create(options: PixelsOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createPixelFaceContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default pixels;
export type { PixelsOptions };
