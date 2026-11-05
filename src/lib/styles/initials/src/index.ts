import type { AvatarOptions, AvatarResult, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, DEFAULT_COLORS, escapeXml, readableColor, resolveTheme } from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

/**
 * Options for the initials style.
 */
export interface InitialsOptions extends AvatarOptions {
    /** Name to extract initials from (defaults to seed) */
    name?: string;
    /** Font family (default: the system UI font) */
    fontFamily?: string;
    /** Font weight (default: 600) */
    fontWeight?: number;
    /** Text color (default: the theme's foreground, otherwise white or near-black, whichever reads better) */
    textColor?: string;
}

/**
 * Extracts initials from a name. An email address uses its local part, so
 * `ana.li@example.com` gives `AL` rather than `A`.
 */
function getInitials(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return "?";

    const words = trimmed.includes("@") ? trimmed.split("@")[0].split(/[._+-]+/) : trimmed.split(/\s+/);
    const initials = words
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => Array.from(part)[0].toUpperCase())
        .join("");
    return initials || "?";
}

// Unquoted on purpose: this value sits inside an attribute of a data URI.
const FONT_STACK = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

/**
 * Creates initials style avatar content
 */
function createInitialsContent(options: InitialsOptions, backgroundColor: string): string {
    const size = options.size ?? 64;
    const initials = getInitials(options.name ?? options.seed);
    const fontFamily = options.fontFamily ?? FONT_STACK;
    const fontWeight = options.fontWeight ?? 600;
    // With no background, the page behind could be any colour. The palette's
    // mid-tones hold up on both light and dark, where black or white would vanish.
    const automatic = options.transparent ? backgroundColor : readableColor(backgroundColor);
    const textColor = options.textColor ?? resolveTheme(options.theme)?.foreground ?? automatic;

    // Two letters take up more room, so they get a smaller size.
    const fontSize = size * (Array.from(initials).length === 1 ? 0.5 : 0.4);

    return `<text x="${size / 2}" y="${size / 2}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${escapeXml(initials)}</text>`;
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

        const content = createInitialsContent(options, backgroundColor);

        return buildSvg(content, options, backgroundColor);
    },
};

export default initials;
