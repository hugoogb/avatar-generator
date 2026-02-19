import type { AvatarResult, InitialsOptions, Style } from "@avatar-generator/core";
import {
  buildSvg,
  createRandom,
  DEFAULT_COLORS,
  escapeXml,
} from "@avatar-generator/core";

/**
 * Extracts initials from a name string
 */
function getInitials(name: string): string {
  if (!name.trim()) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Creates initials style avatar content
 */
function createInitialsContent(options: InitialsOptions): string {
  const size = options.size ?? 64;
  const name = options.name ?? options.seed;
  const initials = getInitials(name);
  const fontFamily = options.fontFamily ?? "sans-serif";
  const fontWeight = options.fontWeight ?? 600;
  const textColor = options.textColor ?? "#fff";

  // Calculate font size based on avatar size and number of initials
  const fontSize = size * (initials.length === 1 ? 0.5 : 0.4);

  return `<text
    x="${size / 2}"
    y="${size / 2}"
    font-family="${fontFamily}"
    font-size="${fontSize}"
    font-weight="${fontWeight}"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="central">${escapeXml(initials)}</text>`;
}

/**
 * Initials avatar style
 *
 * Creates avatars with 1-2 letter initials on a colored background.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { initials } from '@avatar-generator/style-initials';
 *
 * const avatar = createAvatar(initials, {
 *   seed: 'Hugo GB',
 *   size: 64,
 *   colors: ['#FF6B6B', '#4ECDC4'],
 * });
 * ```
 */
export const initials: Style<InitialsOptions> = {
  name: "initials",

  create(options: InitialsOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createInitialsContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default initials;
export type { InitialsOptions };
