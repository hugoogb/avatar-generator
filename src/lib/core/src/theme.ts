import type { AvatarOptions, AvatarTheme, AvatarThemeName } from "./types";

/** Pale backgrounds with dark text. */
export const LIGHT_THEME: AvatarTheme = {
    name: "light",
    colors: [
        "#FFD6D6",
        "#C9F2EE",
        "#CDEBF6",
        "#D5EDE0",
        "#FFF3C4",
        "#EFD9EF",
        "#D3F1E8",
        "#FBEFC0",
        "#E4D4EE",
        "#D2E6F6",
    ],
    foreground: "#1F2933",
};

/** Deep backgrounds with white text. Same length as {@link LIGHT_THEME}. */
export const DARK_THEME: AvatarTheme = {
    name: "dark",
    colors: [
        "#7A1F2B",
        "#0F5E57",
        "#14557A",
        "#2F5D46",
        "#6B5310",
        "#5E2B63",
        "#1D5E50",
        "#6E4A0E",
        "#4B2E78",
        "#1E4C80",
    ],
    foreground: "#FFFFFF",
};

/**
 * Near-black backgrounds, white text and a white ring. Every pairing clears the
 * 7:1 WCAG AAA ratio, and the ring separates the disc from a dark page.
 * Same length as the others so an avatar keeps its palette slot.
 */
export const HIGH_CONTRAST_THEME: AvatarTheme = {
    name: "high-contrast",
    colors: [
        "#000000",
        "#00205B",
        "#3B0A45",
        "#003B1F",
        "#5C0011",
        "#3D2400",
        "#1A1A1A",
        "#002B36",
        "#2D1B00",
        "#1B0033",
    ],
    foreground: "#FFFFFF",
    border: { width: 2, color: "#FFFFFF" },
};

const BUILT_IN: Record<AvatarThemeName, AvatarTheme> = {
    light: LIGHT_THEME,
    dark: DARK_THEME,
    "high-contrast": HIGH_CONTRAST_THEME,
};

/**
 * Declares a custom theme, rejecting an empty palette up front rather than when
 * the first avatar tries to pick from it.
 *
 * @example
 * ```ts
 * const brand = defineTheme({ name: "brand", colors: ["#0B3D91", "#FC3D21"], foreground: "#fff" });
 * createAvatar(faces, { seed: "user-42", theme: brand });
 * ```
 */
export function defineTheme(theme: AvatarTheme): AvatarTheme {
    if (theme.colors.length === 0) {
        throw new Error(`[@avatar-generator/core] Theme ${JSON.stringify(theme.name)} needs at least one colour.`);
    }
    return theme;
}

/**
 * Turns the `theme` option into a theme object. Returns `undefined` for no
 * theme and for `"auto"`, which `createAvatar` expands before a style runs.
 *
 * Styles call this to read `foreground` when they draw over the palette.
 *
 * @throws If `theme` is a string that names no built-in theme
 */
export function resolveTheme(theme: AvatarOptions["theme"]): AvatarTheme | undefined {
    if (theme === undefined || theme === "auto") return undefined;
    if (typeof theme !== "string") return theme;

    const resolved = BUILT_IN[theme];
    if (!resolved) {
        const valid = [...Object.keys(BUILT_IN), "auto"].map((name) => JSON.stringify(name)).join(", ");
        throw new Error(`[@avatar-generator/core] Invalid theme: ${JSON.stringify(theme)}. Expected one of: ${valid}.`);
    }
    return resolved;
}
