// Re-export types
export type {
    AvatarOptions,
    AvatarResult,
    AvatarTheme,
    AvatarThemeName,
    ComposableStyle,
    HeadBox,
    IdleAnimation,
    LayerContext,
    LayerRender,
    LegacyAvatarOptions,
    Random,
    Style,
    StyleLayer,
} from "./types";
export type { FeatureSource, MixOptions, StyleDefinition } from "./compose";
export type { BuildSvgOptions } from "./svg";
export type { AvatarGroupItem, AvatarGroupOptions, AvatarGroupResult } from "./group";
export type { RenderToStringOptions } from "./ssr";
export type { ViewerPreferences } from "./viewer";
export type { AvatarTransitionOptions } from "./transition";

// Re-export utilities
export { createRandom } from "./random";
export { validateOption } from "./validation";
export { animationCss, resolveAnimations } from "./animation";
export { contrastRatio, pickContrasting, readableColor } from "./color";
export {
    adaptForImage,
    adaptGroupForImage,
    NO_PREFERENCES,
    subscribeViewerPreferences,
    viewerPreferences,
} from "./viewer";
export { defineStyle, mixStyles } from "./compose";
export { createAvatar } from "./create";
export { createAvatarGroup } from "./group";
export { renderToString } from "./ssr";
export { HIGH_CONTRAST_THEME, DARK_THEME, LIGHT_THEME, defineTheme, resolveTheme } from "./theme";
export { createAvatarTransition } from "./transition";
export {
    accessibleMarkup,
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
    HAIR_COLORS,
    layerGroup,
    scopeSvgIds,
    SKIN_TONES,
    svgToDataUri,
    toAvatarResult,
    wrapWithTransform,
} from "./svg";

import type { LegacyAvatarOptions } from "./types";

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
