import type { Random } from "./types";

/** Linear-light luminance of a hex colour, or `undefined` if it is not hex. */
function luminance(color: string): number | undefined {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
    if (!match) return undefined;

    const hex = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join("") : match[1];
    const [r, g, b] = [0, 2, 4]
        .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
        .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The WCAG contrast ratio between two hex colours, from 1 to 21. Colours it
 * cannot parse, such as named colours, report 21: a caller's explicit choice is
 * not second-guessed.
 */
export function contrastRatio(a: string, b: string): number {
    const first = luminance(a);
    const second = luminance(b);
    if (first === undefined || second === undefined) return 21;
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** Whichever of two colours is easier to read on `background`. */
export function readableColor(background: string, light = "#FFFFFF", dark = "#111827"): string {
    return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/**
 * Picks from `colors` among those that stand out against `against`. If none
 * reaches `minRatio`, returns the one with the most contrast. Always makes one
 * draw, so the sequence after it does not depend on the palette.
 */
export function pickContrasting(random: Random, colors: string[], against: string, minRatio = 3): string {
    const usable = colors.filter((color) => contrastRatio(color, against) >= minRatio);
    if (usable.length > 0) return random.pick(usable);

    const fallback = random.pick(colors);
    return colors.reduce(
        (best, color) => (contrastRatio(color, against) > contrastRatio(best, against) ? color : best),
        fallback,
    );
}
