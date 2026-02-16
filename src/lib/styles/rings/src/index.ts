import type { Style, RingsOptions, AvatarResult } from "@avatar-generator/core";
import type { Random } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, buildSvg } from "@avatar-generator/core";

type RingType = "solid" | "segmented" | "dashed";

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
  color: string
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
function drawSegmentedRing(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  random: Random,
  colors: string[],
  rotationOffset: number
): string {
  const segmentCounts = [2, 3, 4, 6];
  const segments = random.pick(segmentCounts);
  const color1 = random.pick(colors);
  const color2 = random.pick(colors);
  const angleStep = 360 / segments;
  let content = "";

  for (let i = 0; i < segments; i++) {
    const start = rotationOffset + i * angleStep;
    const end = start + angleStep;
    const color = i % 2 === 0 ? color1 : color2;
    content += arcSegment(cx, cy, innerR, outerR, start, end, color);
  }

  return content;
}

/**
 * Draws a dashed ring
 */
function drawDashedRing(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  random: Random,
  colors: string[]
): string {
  const dashCounts = [8, 12, 16];
  const dashes = random.pick(dashCounts);
  const color = random.pick(colors);
  const angleStep = 360 / dashes;
  const dashAngle = angleStep * 0.6; // 60% dash, 40% gap
  let content = "";

  for (let i = 0; i < dashes; i++) {
    const start = i * angleStep;
    const end = start + dashAngle;
    content += arcSegment(cx, cy, innerR, outerR, start, end, color);
  }

  return content;
}

/**
 * Draws a center decoration
 */
function drawCenterDecoration(
  cx: number,
  cy: number,
  radius: number,
  style: string,
  color: string
): string {
  switch (style) {
    case "dot":
      return `<circle cx="${cx}" cy="${cy}" r="${radius * 0.4}" fill="${color}"/>`;
    case "ring": {
      const outer = radius;
      const inner = radius * 0.5;
      return `<circle cx="${cx}" cy="${cy}" r="${outer}" fill="${color}"/><circle cx="${cx}" cy="${cy}" r="${inner}" fill="none" stroke="${color}" stroke-width="1"/>`;
    }
    case "diamond": {
      const d = radius * 0.7;
      return `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${color}"/>`;
    }
    case "none":
      return "";
    default: // "solid"
      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}"/>`;
  }
}

/**
 * Creates concentric rings style avatar content with segmented/dashed variants
 */
function createRingsContent(options: RingsOptions): string {
  const size = options.size ?? 64;
  const ringCount = options.ringCount ?? 4;
  const ringGap = options.ringGap ?? 2;
  const colors = options.colors ?? DEFAULT_COLORS;
  const allowSegmented = options.segmented !== false;
  const allowDashed = options.dashed !== false;
  const centerStyle = options.centerStyle ?? "solid";
  const random = createRandom(options.seed);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2;

  // Calculate ring widths accounting for gaps
  const totalGap = ringGap * (ringCount - 1);
  const availableSpace = maxRadius - totalGap;
  const ringWidth = availableSpace / ringCount;

  let content = "";

  // Draw rings from outside to inside so inner rings overlay outer
  for (let i = ringCount - 1; i >= 0; i--) {
    const outerRadius = maxRadius - i * (ringWidth + ringGap);
    const innerRadius = outerRadius - ringWidth;

    if (innerRadius > 0) {
      // Decide ring type
      let ringType: RingType = "solid";
      if (allowSegmented && allowDashed) {
        ringType = random.pick(["solid", "segmented", "dashed"]);
      } else if (allowSegmented) {
        ringType = random.pick(["solid", "segmented"]);
      } else if (allowDashed) {
        ringType = random.pick(["solid", "dashed"]);
      }

      switch (ringType) {
        case "segmented": {
          const rotationOffset = random.int(0, 360);
          content += drawSegmentedRing(cx, cy, innerRadius, outerRadius, random, colors, rotationOffset);
          break;
        }
        case "dashed":
          content += drawDashedRing(cx, cy, innerRadius, outerRadius, random, colors);
          break;
        default: {
          // Solid ring (original behavior)
          const color = random.pick(colors);
          content += `<path d="M ${cx} ${cy - outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius} M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}" fill="${color}" fill-rule="evenodd"/>`;
          break;
        }
      }
    } else {
      // Innermost — use center decoration
      const color = random.pick(colors);
      content += drawCenterDecoration(cx, cy, outerRadius, centerStyle, color);
    }
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
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createRingsContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default rings;
export type { RingsOptions };
