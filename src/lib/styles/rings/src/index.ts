import type { Style, RingsOptions, AvatarResult } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, buildSvg } from "@avatar-generator/core";

/**
 * Creates concentric rings style avatar content
 */
function createRingsContent(options: RingsOptions): string {
  const size = options.size ?? 64;
  const ringCount = options.ringCount ?? 4;
  const ringGap = options.ringGap ?? 2;
  const colors = options.colors ?? DEFAULT_COLORS;
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
    const color = random.pick(colors);
    const outerRadius = maxRadius - i * (ringWidth + ringGap);
    const innerRadius = outerRadius - ringWidth;

    if (innerRadius > 0) {
      // Draw as a ring (donut shape) using path
      content += `<path d="
        M ${cx} ${cy - outerRadius}
        A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}
        A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}
        M ${cx} ${cy - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}
      " fill="${color}" fill-rule="evenodd"/>`;
    } else {
      // Innermost is a filled circle
      content += `<circle cx="${cx}" cy="${cy}" r="${outerRadius}" fill="${color}"/>`;
    }
  }

  return content;
}

/**
 * Rings avatar style
 *
 * Creates avatars with colorful concentric rings.
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
