import type { AvatarOptions, AvatarResult, Style } from "@avatar-generator/core";
import {
    buildSvg,
    createRandom,
    DEFAULT_COLORS,
    HAIR_COLORS,
    layerGroup,
    pickContrasting,
    resolveAnimations,
    SKIN_TONES,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export interface PixelsOptions extends AvatarOptions {
    /** Pixels per side of the canvas, at least 12, which is the sprite itself (default: 12) */
    pixelSize?: number;
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Enable accessories like glasses (default: true) */
    accessories?: boolean;
    /** Override feature color (eyes, mouth) */
    featureColor?: string;
}

type HairStyle = "none" | "flat" | "spiky" | "side" | "mohawk" | "full";
type EyeStyle = "dot" | "wide" | "closed" | "wink";
type MouthStyle = "smile" | "neutral" | "open" | "smirk";

const HAIR_STYLES: HairStyle[] = ["none", "flat", "spiky", "side", "mohawk", "full"];
const EYE_STYLES: EyeStyle[] = ["dot", "wide", "closed", "wink"];
const MOUTH_STYLES: MouthStyle[] = ["smile", "neutral", "open", "smirk"];

/**
 * Returns pixel coordinates for a hair style (rows 0-1 area)
 */
/** Sprite size. Larger grids add margin around it. */
const SPRITE = 12;
const SHIRTS = ["#1F2937", "#F3F4F6", "#374151", "#FFFFFF"];

type Pixel = [row: number, col: number];

/** Every (row, col) in a rectangle, inclusive. */
function block(rowFrom: number, rowTo: number, colFrom: number, colTo: number): Pixel[] {
    const pixels: Pixel[] = [];
    for (let row = rowFrom; row <= rowTo; row++) {
        for (let col = colFrom; col <= colTo; col++) pixels.push([row, col]);
    }
    return pixels;
}

function getHairPixels(style: HairStyle): Pixel[] {
    switch (style) {
        case "none":
            return [];
        case "flat":
            return [...block(1, 3, 3, 8), ...block(2, 4, 2, 2), ...block(2, 4, 9, 9)];
        case "spiky":
            return [[0, 3], [0, 6], [0, 8], ...block(1, 1, 3, 8), ...block(2, 3, 2, 9)];
        case "side":
            return [...block(1, 2, 3, 9), ...block(3, 3, 2, 7), ...block(4, 5, 2, 2), [3, 9]];
        case "mohawk":
            return block(0, 3, 5, 6);
        case "full":
            return [...block(1, 3, 3, 8), ...block(2, 8, 1, 2), ...block(2, 8, 9, 10)];
    }
}

function getEyePixels(style: EyeStyle): { dark: Pixel[]; white: Pixel[] } {
    const open = (col: number): Pixel[] => block(5, 6, col, col);
    const shut = (col: number): Pixel[] => block(6, 6, col - 1, col);

    switch (style) {
        case "dot":
            return { dark: [...open(4), ...open(7)], white: [] };
        case "wide":
            return { dark: [...open(4), ...open(7)], white: [...open(3), ...open(8)] };
        case "closed":
            return { dark: [...shut(4), ...shut(8)], white: [] };
        case "wink":
            return { dark: [...open(4), ...shut(8)], white: [] };
    }
}

function getMouthPixels(style: MouthStyle): Pixel[] {
    switch (style) {
        case "smile":
            return [[8, 4], [8, 7], ...block(9, 9, 5, 6)];
        case "neutral":
            return block(8, 8, 5, 6);
        case "open":
            return block(8, 9, 5, 6);
        case "smirk":
            return [[8, 7], ...block(9, 9, 5, 6)];
    }
}

function createPixelFaceContent(options: PixelsOptions): string {
    const size = options.size ?? 64;
    const grid = Math.max(options.pixelSize ?? SPRITE, SPRITE);
    const margin = Math.floor((grid - SPRITE) / 2);
    const skinTones = options.skinTones ?? SKIN_TONES;
    const random = createRandom(options.seed);

    const cellSize = size / grid;
    const skinColor = random.pick(skinTones);
    // Apart from the skin, or a short cut would read as a bald head.
    const hairColor = pickContrasting(random, HAIR_COLORS, skinColor, 1.6);
    const shirtColor = random.pick(SHIRTS);
    const featureColor = options.featureColor ?? "#1A0E08";

    const hairStyle = random.pick(HAIR_STYLES);
    const eyeStyle = random.pick(EYE_STYLES);
    const mouthStyle = random.pick(MOUTH_STYLES);
    const hasEyebrows = random.bool(0.4);
    const hasNose = random.bool(0.3);
    const hasAccessories = options.accessories !== false && random.bool(0.15);

    const pixelMap = new Map<string, string>();
    const paint = (pixels: Pixel[], color: string): void => {
        for (const [row, col] of pixels) pixelMap.set(`${row},${col}`, color);
    };

    paint([...block(10, 10, 2, 9), ...block(11, 11, 1, 10)], shirtColor);
    paint(block(3, 9, 2, 9), skinColor);
    // Round off the head's corners.
    for (const corner of ["9,2", "9,9"]) pixelMap.delete(corner);

    if (hasEyebrows) paint([...block(4, 4, 3, 4), ...block(4, 4, 7, 8)], hairColor);
    paint(getHairPixels(hairStyle), hairColor);

    const eyes = getEyePixels(eyeStyle);
    paint(eyes.white, "#FFFFFF");
    paint(eyes.dark, featureColor);
    const eyeKeys = new Set([...eyes.white, ...eyes.dark].map(([row, col]) => `${row},${col}`));

    if (hasNose) paint([[7, 5]], featureColor);

    paint(getMouthPixels(mouthStyle), featureColor);
    if (mouthStyle === "open") paint(block(9, 9, 5, 6), "#B4233A");

    if (hasAccessories) {
        paint([...block(5, 5, 2, 9)], featureColor);
        paint(
            [
                [6, 3],
                [6, 4],
                [6, 7],
                [6, 8],
            ],
            featureColor,
        );
    }

    // Eye pixels only get their own group when something will use it.
    const separateEyes = Boolean(options.classes) || resolveAnimations(options).blink;
    let content = "";
    let eyeContent = "";
    for (const [key, color] of pixelMap) {
        const [row, col] = key.split(",").map(Number);
        const x = (col + margin) * cellSize;
        const y = (row + margin) * cellSize;
        const rect = `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
        if (separateEyes && eyeKeys.has(key)) eyeContent += rect;
        else content += rect;
    }

    // Abutting pixels must not show hairline seams when antialiased.
    return `<g shape-rendering="crispEdges">${content}${layerGroup("eyes", eyeContent, options)}</g>`;
}

/**
 * Pixels avatar style (Pixel Faces)
 *
 * Creates 8-bit retro pixel face avatars with eyes, mouth, hair, and optional accessories.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { pixels } from '@avatar-generator/style-pixels';
 *
 * const avatar = createAvatar(pixels, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const pixels: Style<PixelsOptions> = {
    name: "pixels",

    create(options: PixelsOptions): AvatarResult {
        const random = createRandom(`${options.seed}:background`);
        const colors = options.colors ?? DEFAULT_COLORS;
        const backgroundColor = random.pick(colors);

        const content = createPixelFaceContent(options);

        return buildSvg(content, options, backgroundColor);
    },
};

export default pixels;
