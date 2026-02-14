// Re-export types
export type {
  AvatarOptions, AvatarResult, GeometricOptions, InitialsOptions, LegacyAvatarOptions, PixelsOptions, Random, RingsOptions,
  Style
} from "./types";

// Re-export utilities
export { createRandom } from "./random";
export {
  buildSvg, buildTransform, createBackground,
  createBorder, createCircleClip,
  createSquareClip, createSvgOpen, DEFAULT_COLORS,
  escapeXml, wrapWithTransform
} from "./svg";

import type { AvatarOptions, AvatarResult, LegacyAvatarOptions, Style } from "./types";

/**
 * Creates an avatar using the specified style
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { initials } from '@avatar-generator/style-initials';
 *
 * const avatar = createAvatar(initials, { seed: 'John Doe' });
 * // Use avatar.svg for the SVG string
 * // Use avatar.toDataUri() for img src
 * ```
 */
export function createAvatar<T extends AvatarOptions>(
  style: Style<T>,
  options: T
): AvatarResult {
  // Apply defaults
  const opts = {
    size: 64,
    square: false,
    transparent: false,
    rotate: 0,
    flip: false,
    scale: 1,
    ...options,
  } as T;

  return style.create(opts);
}

// ============================================================================
// Legacy v1 API (deprecated, for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use createAvatar with a Style instead
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
 * Creates an avatar as an HTML element (legacy v1 API)
 *
 * @deprecated Use createAvatar with a Style instead for SVG output
 *
 * @example
 * ```ts
 * // Legacy usage (deprecated)
 * import { createAvatarElement } from '@avatar-generator/core';
 * const element = createAvatarElement({ name: 'John Doe' });
 *
 * // New usage (recommended)
 * import { createAvatar } from '@avatar-generator/core';
 * import { initials } from '@avatar-generator/style-initials';
 * const avatar = createAvatar(initials, { seed: 'John Doe' });
 * ```
 */
export function createAvatarElement({
  name,
  backgroundColor = "#ccc",
  gradientDirection = "vertical",
  textColor = "#fff",
  fontSize = "40px",
  shape = "circle",
  width = "100px",
  height = "100px",
  tooltip = false,
  additionalClasses = "",
}: LegacyAvatarOptions): HTMLElement {
  const initials = getInitials(name);

  const avatar = document.createElement("div");
  avatar.style.width = width;
  avatar.style.height = height;

  if (Array.isArray(backgroundColor)) {
    const direction =
      gradientDirection === "vertical" ? "to bottom" : "to right";
    avatar.style.background = `linear-gradient(${direction}, ${backgroundColor.join(", ")})`;
  } else {
    avatar.style.backgroundColor = backgroundColor;
  }

  avatar.style.color = textColor;
  avatar.style.display = "flex";
  avatar.style.justifyContent = "center";
  avatar.style.alignItems = "center";
  avatar.style.fontSize = fontSize;
  avatar.style.borderRadius = shape === "circle" ? "50%" : "0";
  avatar.textContent = initials;

  if (tooltip) {
    avatar.title = name;
  }

  if (additionalClasses) {
    avatar.className = additionalClasses;
  }

  return avatar;
}
