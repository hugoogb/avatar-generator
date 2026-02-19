import type { Style, FacesOptions, AvatarResult } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, SKIN_TONES, buildSvg } from "@avatar-generator/core";

/**
 * Face shape types — faces uses distinct geometric shapes for the head
 */
type FaceShape = "circle" | "square" | "rounded-square";
type HairStyle = "none" | "flat-top" | "cap" | "side-swept" | "spiky" | "round-top" | "mohawk" | "beanie";
type EyeStyle = "dots" | "rectangles" | "lines" | "round";
type MouthStyle = "line" | "rect-smile" | "open-rect" | "zigzag" | "dot";

const FACE_SHAPES: FaceShape[] = ["circle", "square", "rounded-square"];
const HAIR_STYLES: HairStyle[] = ["none", "flat-top", "cap", "side-swept", "spiky", "round-top", "mohawk", "beanie"];
const EYE_STYLES: EyeStyle[] = ["dots", "rectangles", "lines", "round"];
const MOUTH_STYLES: MouthStyle[] = ["line", "rect-smile", "open-rect", "zigzag", "dot"];

/**
 * Draws the head shape — faces uses bold geometric shapes (circle, square, rounded-square)
 * instead of the ellipses used by illustrated
 */
function drawHead(
  shape: FaceShape,
  cx: number,
  cy: number,
  headSize: number,
  color: string
): string {
  const half = headSize / 2;
  switch (shape) {
    case "circle":
      return `<circle cx="${cx}" cy="${cy}" r="${half}" fill="${color}"/>`;
    case "square":
      return `<rect x="${cx - half}" y="${cy - half}" width="${headSize}" height="${headSize}" fill="${color}"/>`;
    case "rounded-square":
      return `<rect x="${cx - half}" y="${cy - half}" width="${headSize}" height="${headSize}" rx="${headSize * 0.2}" fill="${color}"/>`;
  }
}

/**
 * Draws hair — uses flat geometric blocks instead of bezier curves
 */
function drawHair(
  style: HairStyle,
  cx: number,
  cy: number,
  headSize: number,
  color: string
): string {
  const half = headSize / 2;
  const top = cy - half;
  const left = cx - half;
  const right = cx + half;

  switch (style) {
    case "none":
      return "";
    case "flat-top":
      // Flat rectangular block on top
      return `<rect x="${left - 2}" y="${top - 6}" width="${headSize + 4}" height="${headSize * 0.25 + 6}" fill="${color}"/>`;
    case "cap":
      // Semi-circle cap on top
      return `<path d="M ${left - 3} ${cy - half * 0.3} A ${half + 3} ${half + 3} 0 0 1 ${right + 3} ${cy - half * 0.3} L ${right + 3} ${top + 2} L ${left - 3} ${top + 2} Z" fill="${color}"/>`;
    case "side-swept":
      // Angular block shifted to one side
      return `<polygon points="${left - 4},${top + 4} ${left - 4},${top - 8} ${cx + half * 0.3},${top - 8} ${right},${top + 4}" fill="${color}"/>`;
    case "spiky":
      // Triangle spikes on top
      return `<polygon points="${left},${top + 2} ${left + headSize * 0.15},${top - 10} ${left + headSize * 0.3},${top + 2}" fill="${color}"/>`
        + `<polygon points="${cx - headSize * 0.15},${top + 2} ${cx},${top - 14} ${cx + headSize * 0.15},${top + 2}" fill="${color}"/>`
        + `<polygon points="${right - headSize * 0.3},${top + 2} ${right - headSize * 0.15},${top - 10} ${right},${top + 2}" fill="${color}"/>`;
    case "round-top":
      // Large semicircle sitting on top of head
      return `<circle cx="${cx}" cy="${top}" r="${half * 0.7}" fill="${color}"/>`;
    case "mohawk":
      // Tall narrow rectangle on top center
      return `<rect x="${cx - 4}" y="${top - 14}" width="8" height="${headSize * 0.3 + 14}" rx="2" fill="${color}"/>`;
    case "beanie":
      // Rectangle with rounded top covering upper portion
      return `<rect x="${left - 3}" y="${top - 4}" width="${headSize + 6}" height="${headSize * 0.35 + 4}" rx="${headSize * 0.15}" fill="${color}"/>`
        + `<rect x="${left - 4}" y="${top + headSize * 0.2}" width="${headSize + 8}" height="4" rx="2" fill="${color}" opacity="0.7"/>`;
  }
}

/**
 * Draws eyes — uses simple geometric shapes (dots, rectangles, lines)
 * distinct from illustrated's detailed eye whites + iris + highlights
 */
function drawEyes(
  style: EyeStyle,
  cx: number,
  eyeY: number,
  spacing: number,
  color: string
): string {
  const lx = cx - spacing;
  const rx = cx + spacing;

  switch (style) {
    case "dots":
      return `<circle cx="${lx}" cy="${eyeY}" r="2.5" fill="${color}"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="2.5" fill="${color}"/>`;
    case "rectangles":
      return `<rect x="${lx - 3}" y="${eyeY - 2}" width="6" height="4" fill="${color}"/>`
        + `<rect x="${rx - 3}" y="${eyeY - 2}" width="6" height="4" fill="${color}"/>`;
    case "lines":
      return `<line x1="${lx - 3}" y1="${eyeY}" x2="${lx + 3}" y2="${eyeY}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`
        + `<line x1="${rx - 3}" y1="${eyeY}" x2="${rx + 3}" y2="${eyeY}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "round":
      return `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white" stroke="${color}" stroke-width="1.5"/>`
        + `<circle cx="${lx}" cy="${eyeY}" r="1.5" fill="${color}"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white" stroke="${color}" stroke-width="1.5"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="1.5" fill="${color}"/>`;
  }
}

/**
 * Draws mouth — uses flat geometric shapes instead of bezier curves
 */
function drawMouth(
  style: MouthStyle,
  cx: number,
  mouthY: number,
  color: string
): string {
  switch (style) {
    case "line":
      return `<line x1="${cx - 5}" y1="${mouthY}" x2="${cx + 5}" y2="${mouthY}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
    case "rect-smile":
      // U-shaped smile using rect with only bottom half visible
      return `<rect x="${cx - 5}" y="${mouthY - 1}" width="10" height="6" rx="3" fill="none" stroke="${color}" stroke-width="1.5"/>`
        + `<rect x="${cx - 5}" y="${mouthY - 2}" width="10" height="3" fill="currentBackground" opacity="0"/>`;
    case "open-rect":
      return `<rect x="${cx - 4}" y="${mouthY - 2}" width="8" height="5" rx="1" fill="${color}"/>`;
    case "zigzag":
      return `<polyline points="${cx - 5},${mouthY} ${cx - 2},${mouthY + 3} ${cx + 2},${mouthY} ${cx + 5},${mouthY + 3}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "dot":
      return `<circle cx="${cx}" cy="${mouthY + 1}" r="2.5" fill="${color}"/>`;
  }
}

/**
 * Creates faces avatar content — bold, geometric, icon-style faces
 */
function createFacesContent(options: FacesOptions): string {
  const size = options.size ?? 64;
  const skinTones = options.skinTones ?? SKIN_TONES;
  const colors = options.colors ?? DEFAULT_COLORS;
  const random = createRandom(options.seed);

  const skinColor = random.pick(skinTones);
  const hairColor = random.pick(colors);
  const featureColor = options.featureColor ?? "#2C1810";

  // Face shape — unique to this style
  const faceShape = random.pick(FACE_SHAPES);

  // Pick features
  const hairStyle: HairStyle = (options.hairStyle as HairStyle) ?? random.pick(HAIR_STYLES);
  const eyeStyle: EyeStyle = (options.eyeStyle as EyeStyle) ?? random.pick(EYE_STYLES);
  const mouthStyle: MouthStyle = (options.mouthStyle as MouthStyle) ?? random.pick(MOUTH_STYLES);
  const showEyebrows = options.eyebrows !== false && random.bool(0.5);
  const showEars = options.ears !== false && random.bool(0.4);
  const showNose = options.nose !== false && random.bool(0.3);
  const showBlush = random.bool(0.25);

  // Geometry — faces uses a single headSize (square proportions) instead of elliptical
  const cx = size / 2;
  const cy = size / 2;
  const headSize = size * 0.6;
  const eyeY = cy - headSize * 0.1;
  const eyeSpacing = headSize * 0.22;
  const mouthY = cy + headSize * 0.2;

  let content = "";

  // 1. Hair behind (only styles that extend behind head)
  if (hairStyle === "round-top") {
    content += drawHair(hairStyle, cx, cy, headSize, hairColor);
  }

  // 2. Ears — simple circles
  if (showEars) {
    const earR = size * 0.06;
    content += `<circle cx="${cx - headSize / 2 - earR * 0.5}" cy="${cy}" r="${earR}" fill="${skinColor}"/>`;
    content += `<circle cx="${cx + headSize / 2 + earR * 0.5}" cy="${cy}" r="${earR}" fill="${skinColor}"/>`;
  }

  // 3. Head
  content += drawHead(faceShape, cx, cy, headSize, skinColor);

  // 4. Hair (on top)
  if (hairStyle !== "round-top") {
    content += drawHair(hairStyle, cx, cy, headSize, hairColor);
  }

  // 5. Eyes
  content += drawEyes(eyeStyle, cx, eyeY, eyeSpacing, featureColor);

  // 6. Eyebrows — simple straight lines
  if (showEyebrows) {
    const browY = eyeY - 6;
    const lx = cx - eyeSpacing;
    const rx = cx + eyeSpacing;
    content += `<line x1="${lx - 3}" y1="${browY}" x2="${lx + 3}" y2="${browY}" stroke="${featureColor}" stroke-width="2" stroke-linecap="round"/>`;
    content += `<line x1="${rx - 3}" y1="${browY}" x2="${rx + 3}" y2="${browY}" stroke="${featureColor}" stroke-width="2" stroke-linecap="round"/>`;
  }

  // 7. Nose — simple vertical line or dot
  if (showNose) {
    const noseY = cy + headSize * 0.04;
    content += `<line x1="${cx}" y1="${noseY - 2}" x2="${cx}" y2="${noseY + 2}" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`;
  }

  // 8. Mouth
  content += drawMouth(mouthStyle, cx, mouthY, featureColor);

  // 9. Blush — two simple circles on cheeks
  if (showBlush) {
    const blushY = cy + headSize * 0.08;
    content += `<circle cx="${cx - eyeSpacing - 2}" cy="${blushY}" r="3" fill="#FF6B6B" opacity="0.3"/>`;
    content += `<circle cx="${cx + eyeSpacing + 2}" cy="${blushY}" r="3" fill="#FF6B6B" opacity="0.3"/>`;
  }

  return content;
}

/**
 * Faces avatar style
 *
 * Creates bold, geometric, icon-style face avatars with varied head shapes
 * (circle, square, rounded-square), flat hair blocks, and simple geometric features.
 * Visually distinct from the illustrated style which uses detailed bezier curves.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { faces } from '@avatar-generator/style-faces';
 *
 * const avatar = createAvatar(faces, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const faces: Style<FacesOptions> = {
  name: "faces",

  create(options: FacesOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createFacesContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default faces;
export type { FacesOptions };
