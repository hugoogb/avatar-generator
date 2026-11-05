import { HIGH_CONTRAST_THEME, DARK_THEME, LIGHT_THEME, resolveTheme } from "./theme";
import { accessibleMarkup, createSvgOpen, scopeSvgIds, toAvatarResult } from "./svg";
import type { AvatarOptions, AvatarResult, Style } from "./types";

/**
 * Hides every variant but the one the viewer's preferences select. Contrast
 * comes last so that it wins over the colour scheme.
 */
const AUTO_THEME_CSS =
    ".ag-theme-dark,.ag-theme-contrast{display:none}" +
    "@media (prefers-color-scheme:dark){.ag-theme-light{display:none}.ag-theme-dark{display:inline}}" +
    "@media (prefers-contrast:more){.ag-theme-light,.ag-theme-dark{display:none}.ag-theme-contrast{display:inline}}";

/**
 * Fills, stroke colours and palettes are baked into the markup, so one drawing
 * cannot be recoloured by a media query. The output carries one drawing per
 * theme instead, and CSS shows the right one. `prefers-color-scheme` also works
 * inside `<img>`, which no JavaScript theme switch could reach once it has
 * loaded. `prefers-contrast` may not: see `adaptForImage`.
 */
function createAutoThemedAvatar<T extends AvatarOptions>(style: Style<T>, options: T): AvatarResult {
    const size = options.size ?? 64;
    const accessible = accessibleMarkup(options);
    const variant = (theme: typeof LIGHT_THEME, className: string) => {
        const { svg } = createAvatar(style, { ...options, theme, title: undefined, description: undefined });
        return `<g class="${className}">${scopeSvgIds(svg, className)}</g>`;
    };

    return toAvatarResult(
        createSvgOpen(size, accessible.attributes) +
            accessible.children +
            `<style>${AUTO_THEME_CSS}</style>` +
            variant(LIGHT_THEME, "ag-theme-light") +
            variant(DARK_THEME, "ag-theme-dark") +
            variant(HIGH_CONTRAST_THEME, "ag-theme-contrast") +
            "</svg>",
    );
}

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

    if (opts.theme === "auto") return createAutoThemedAvatar(style, opts);

    const theme = resolveTheme(opts.theme);
    if (theme) {
        opts.colors ??= theme.colors;
        opts.border ??= theme.border;
    }

    return style.create(opts);
}
