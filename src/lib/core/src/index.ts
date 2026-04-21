// Re-export types
export type {
    AnimeEyeStyle,
    AnimeHairStyle,
    AnimeMouthStyle,
    AnimeNoseStyle,
    AnimeOptions,
    AvatarOptions,
    AvatarResult,
    FacesEyeStyle,
    FacesHairStyle,
    FacesMouthStyle,
    FacesOptions,
    GeometricOptions,
    IllustratedEyeStyle,
    IllustratedEyebrowStyle,
    IllustratedHairStyle,
    IllustratedMouthStyle,
    IllustratedNoseStyle,
    IllustratedOptions,
    InitialsOptions,
    LegacyAvatarOptions,
    PixelsOptions,
    Random,
    RingsCenterStyle,
    RingsOptions,
    Style,
} from "./types";

// Re-export utilities
export { createRandom } from "./random";
export { validateOption } from "./validation";
export {
    buildSvg,
    buildTransform,
    createBackground,
    createBorder,
    createCircleClip,
    createSquareClip,
    createSvgOpen,
    DEFAULT_COLORS,
    escapeXml,
    EYE_COLORS,
    SKIN_TONES,
    wrapWithTransform,
} from "./svg";

import type { AvatarOptions, AvatarResult, LegacyAvatarOptions, Style } from "./types";

/**
 * Generates a deterministic SVG avatar using a style implementation.
 *
 * The output is determined entirely by `options.seed`: the same seed and the
 * same style always produce byte-identical SVG. Default visual options
 * (size=64, circular shape, opaque background, no transform) are merged in
 * automatically; caller-supplied values in `options` take precedence.
 *
 * @typeParam T - The style-specific options shape, extending {@link AvatarOptions}
 * @param style - A {@link Style} implementation (e.g. `initials`, `faces`, `anime`)
 * @param options - Seed and style-specific settings
 * @returns An {@link AvatarResult} containing the SVG string and a `toDataUri` helper
 *
 * @example Basic usage with the initials style
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { initials } from '@avatar-generator/style-initials';
 *
 * const avatar = createAvatar(initials, { seed: 'Hugo GB' });
 * img.src = avatar.toDataUri();
 * ```
 *
 * @example Custom size, palette, and border
 * ```ts
 * createAvatar(faces, {
 *   seed: 'user-42',
 *   size: 128,
 *   colors: ['#FF6B6B', '#4ECDC4'],
 *   border: { width: 2, color: '#000' },
 * });
 * ```
 */
export function createAvatar<T extends AvatarOptions>(style: Style<T>, options: T): AvatarResult {
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
 * const element = createAvatarElement({ name: 'Hugo GB' });
 *
 * // New usage (recommended)
 * import { createAvatar } from '@avatar-generator/core';
 * import { initials } from '@avatar-generator/style-initials';
 * const avatar = createAvatar(initials, { seed: 'Hugo GB' });
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
        const direction = gradientDirection === "vertical" ? "to bottom" : "to right";
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
