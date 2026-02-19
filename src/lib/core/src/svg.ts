import type { AvatarOptions, AvatarResult } from "./types";

/**
 * Skin tone palette for face-based avatar styles
 */
export const SKIN_TONES = [
  "#FFDBB4",
  "#EAC086",
  "#C68B59",
  "#A0674B",
  "#8D5524",
  "#613915",
];

/**
 * Eye color palette for illustrated avatar styles
 */
export const EYE_COLORS = [
  "#634E34",
  "#2E536F",
  "#3D6B45",
  "#89724B",
  "#3B3024",
];

/**
 * Default color palettes for avatar generation
 */
export const DEFAULT_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Sky blue
  "#96CEB4", // Sage
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Purple
  "#85C1E9", // Light blue
];

/**
 * Escapes special characters for use in SVG text content
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Creates the opening SVG tag with common attributes
 */
export function createSvgOpen(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
}

/**
 * Creates a circle clip path for rounded avatars
 */
export function createCircleClip(id: string, size: number): string {
  const r = size / 2;
  return `<clipPath id="${id}"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath>`;
}

/**
 * Creates a square clip path
 */
export function createSquareClip(id: string, size: number): string {
  return `<clipPath id="${id}"><rect x="0" y="0" width="${size}" height="${size}"/></clipPath>`;
}

/**
 * Creates a background rectangle
 */
export function createBackground(
  size: number,
  color: string,
  transparent = false
): string {
  if (transparent) {
    return "";
  }
  return `<rect x="0" y="0" width="${size}" height="${size}" fill="${color}"/>`;
}

/**
 * Creates a border circle or rect
 */
export function createBorder(
  size: number,
  width: number,
  color: string,
  square: boolean
): string {
  if (square) {
    const offset = width / 2;
    return `<rect x="${offset}" y="${offset}" width="${size - width}" height="${size - width}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  }
  const r = size / 2 - width / 2;
  return `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
}

/**
 * Builds the transform attribute string from options
 */
export function buildTransform(options: AvatarOptions): string {
  const transforms: string[] = [];
  const center = (options.size ?? 64) / 2;

  if (options.rotate) {
    transforms.push(`rotate(${options.rotate} ${center} ${center})`);
  }

  if (options.flip) {
    transforms.push(`scale(-1, 1) translate(-${options.size ?? 64}, 0)`);
  }

  if (options.scale && options.scale !== 1) {
    const offset = center * (1 - options.scale);
    transforms.push(`translate(${offset}, ${offset}) scale(${options.scale})`);
  }

  return transforms.length > 0 ? ` transform="${transforms.join(" ")}"` : "";
}

/**
 * Wraps content with a group that applies transformations
 */
export function wrapWithTransform(
  content: string,
  options: AvatarOptions
): string {
  const transform = buildTransform(options);
  if (!transform) {
    return content;
  }
  return `<g${transform}>${content}</g>`;
}

/**
 * Creates a complete SVG avatar from content
 */
export function buildSvg(
  content: string,
  options: AvatarOptions,
  backgroundColor: string
): AvatarResult {
  const size = options.size ?? 64;
  const clipId = `clip-${Math.random().toString(36).slice(2, 9)}`;

  let svg = createSvgOpen(size);

  // Add defs with clip path
  svg += "<defs>";
  svg += options.square
    ? createSquareClip(clipId, size)
    : createCircleClip(clipId, size);
  svg += "</defs>";

  // Apply clip path to content group
  svg += `<g clip-path="url(#${clipId})">`;

  // Add background
  svg += createBackground(size, backgroundColor, options.transparent);

  // Add transformed content
  svg += wrapWithTransform(content, options);

  svg += "</g>";

  // Add border if specified (outside clip)
  if (options.border) {
    svg += createBorder(
      size,
      options.border.width,
      options.border.color,
      options.square ?? false
    );
  }

  svg += "</svg>";

  return {
    svg,
    toDataUri() {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    },
  };
}
