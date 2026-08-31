import type { Animal, AnimalsOptions, AvatarResult, Style } from "@avatar-generator/core";
import { buildSvg, createRandom, DEFAULT_COLORS, validateOption } from "@avatar-generator/core";

/** All valid animal values for the animals style */
export const ANIMALS: Animal[] = ["cat", "dog", "bear", "fox", "panda", "bunny", "frog", "monkey"];

// Earth-tone fur palette used when the caller does not supply one.
const FUR_TONES = ["#D4A574", "#A67B5B", "#7F5A3C", "#E8C89C", "#C88F5D"];

const STROKE = "#2C1810";
const WHITE = "#FFFFFF";
const PINK = "#FFB6C1";
const BLACK = "#1A1A1A";

interface AnimalGeo {
    cx: number;
    cy: number;
    headW: number;
    headH: number;
    size: number;
}

function computeGeo(size: number): AnimalGeo {
    return {
        cx: size / 2,
        cy: size / 2,
        headW: size * 0.6,
        headH: size * 0.58,
        size,
    };
}

// ─── Cat ─────────────────────────────────────────────────────────────────

function drawCat(g: AnimalGeo, fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earBase = halfW * 0.55;

    return (
        // Ears (triangles on top)
        `<polygon points="${cx - halfW + 2},${cy - halfH * 0.4} ${cx - halfW + earBase * 0.4},${cy - halfH - earBase * 0.8} ${cx - halfW + earBase},${cy - halfH * 0.2}" fill="${fur}"/>` +
        `<polygon points="${cx + halfW - 2},${cy - halfH * 0.4} ${cx + halfW - earBase * 0.4},${cy - halfH - earBase * 0.8} ${cx + halfW - earBase},${cy - halfH * 0.2}" fill="${fur}"/>` +
        // Inner ears
        `<polygon points="${cx - halfW + earBase * 0.45},${cy - halfH * 0.3} ${cx - halfW + earBase * 0.6},${cy - halfH - earBase * 0.4} ${cx - halfW + earBase * 0.85},${cy - halfH * 0.2}" fill="${PINK}"/>` +
        `<polygon points="${cx + halfW - earBase * 0.45},${cy - halfH * 0.3} ${cx + halfW - earBase * 0.6},${cy - halfH - earBase * 0.4} ${cx + halfW - earBase * 0.85},${cy - halfH * 0.2}" fill="${PINK}"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy}" rx="${halfW}" ry="${halfH}" fill="${fur}"/>` +
        // Eyes
        `<ellipse cx="${cx - halfW * 0.35}" cy="${cy - halfH * 0.05}" rx="${halfW * 0.11}" ry="${halfH * 0.14}" fill="${STROKE}"/>` +
        `<ellipse cx="${cx + halfW * 0.35}" cy="${cy - halfH * 0.05}" rx="${halfW * 0.11}" ry="${halfH * 0.14}" fill="${STROKE}"/>` +
        `<circle cx="${cx - halfW * 0.32}" cy="${cy - halfH * 0.1}" r="1.2" fill="${WHITE}"/>` +
        `<circle cx="${cx + halfW * 0.38}" cy="${cy - halfH * 0.1}" r="1.2" fill="${WHITE}"/>` +
        // Nose
        `<polygon points="${cx},${cy + halfH * 0.15} ${cx - 4},${cy + halfH * 0.05} ${cx + 4},${cy + halfH * 0.05}" fill="${PINK}"/>` +
        // Mouth (little w)
        `<path d="M ${cx} ${cy + halfH * 0.15} L ${cx} ${cy + halfH * 0.3} M ${cx} ${cy + halfH * 0.3} Q ${cx - 3} ${cy + halfH * 0.38} ${cx - 6} ${cy + halfH * 0.3} M ${cx} ${cy + halfH * 0.3} Q ${cx + 3} ${cy + halfH * 0.38} ${cx + 6} ${cy + halfH * 0.3}" fill="none" stroke="${STROKE}" stroke-width="1.2" stroke-linecap="round"/>` +
        // Whiskers
        `<line x1="${cx - halfW * 0.35}" y1="${cy + halfH * 0.22}" x2="${cx - halfW - 2}" y2="${cy + halfH * 0.18}" stroke="${STROKE}" stroke-width="0.8"/>` +
        `<line x1="${cx + halfW * 0.35}" y1="${cy + halfH * 0.22}" x2="${cx + halfW + 2}" y2="${cy + halfH * 0.18}" stroke="${STROKE}" stroke-width="0.8"/>`
    );
}

// ─── Dog ─────────────────────────────────────────────────────────────────

function drawDog(g: AnimalGeo, fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;

    return (
        // Floppy ears (drawn first so they sit behind head)
        `<ellipse cx="${cx - halfW * 0.95}" cy="${cy - halfH * 0.1}" rx="${halfW * 0.22}" ry="${halfH * 0.55}" fill="${fur}" transform="rotate(-15 ${cx - halfW * 0.95} ${cy - halfH * 0.1})"/>` +
        `<ellipse cx="${cx + halfW * 0.95}" cy="${cy - halfH * 0.1}" rx="${halfW * 0.22}" ry="${halfH * 0.55}" fill="${fur}" transform="rotate(15 ${cx + halfW * 0.95} ${cy - halfH * 0.1})"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy}" rx="${halfW}" ry="${halfH}" fill="${fur}"/>` +
        // Muzzle
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.35}" rx="${halfW * 0.45}" ry="${halfH * 0.3}" fill="${WHITE}" opacity="0.6"/>` +
        // Eyes
        `<circle cx="${cx - halfW * 0.32}" cy="${cy - halfH * 0.1}" r="${halfW * 0.1}" fill="${STROKE}"/>` +
        `<circle cx="${cx + halfW * 0.32}" cy="${cy - halfH * 0.1}" r="${halfW * 0.1}" fill="${STROKE}"/>` +
        `<circle cx="${cx - halfW * 0.3}" cy="${cy - halfH * 0.14}" r="1.4" fill="${WHITE}"/>` +
        `<circle cx="${cx + halfW * 0.34}" cy="${cy - halfH * 0.14}" r="1.4" fill="${WHITE}"/>` +
        // Nose
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.2}" rx="${halfW * 0.08}" ry="${halfH * 0.08}" fill="${BLACK}"/>` +
        // Tongue / mouth
        `<path d="M ${cx - 5} ${cy + halfH * 0.35} Q ${cx} ${cy + halfH * 0.55} ${cx + 5} ${cy + halfH * 0.35}" fill="${PINK}" stroke="${STROKE}" stroke-width="0.8"/>`
    );
}

// ─── Bear ────────────────────────────────────────────────────────────────

function drawBear(g: AnimalGeo, fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earR = halfW * 0.2;

    return (
        // Ears (small round on top corners)
        `<circle cx="${cx - halfW * 0.8}" cy="${cy - halfH * 0.75}" r="${earR}" fill="${fur}"/>` +
        `<circle cx="${cx + halfW * 0.8}" cy="${cy - halfH * 0.75}" r="${earR}" fill="${fur}"/>` +
        `<circle cx="${cx - halfW * 0.8}" cy="${cy - halfH * 0.75}" r="${earR * 0.55}" fill="${PINK}" opacity="0.6"/>` +
        `<circle cx="${cx + halfW * 0.8}" cy="${cy - halfH * 0.75}" r="${earR * 0.55}" fill="${PINK}" opacity="0.6"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy}" rx="${halfW}" ry="${halfH}" fill="${fur}"/>` +
        // Muzzle (cream patch)
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.3}" rx="${halfW * 0.55}" ry="${halfH * 0.35}" fill="#F5E8D3"/>` +
        // Eyes
        `<circle cx="${cx - halfW * 0.28}" cy="${cy - halfH * 0.12}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        `<circle cx="${cx + halfW * 0.28}" cy="${cy - halfH * 0.12}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        // Nose
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.12}" rx="${halfW * 0.1}" ry="${halfH * 0.08}" fill="${BLACK}"/>` +
        // Mouth
        `<path d="M ${cx} ${cy + halfH * 0.2} L ${cx} ${cy + halfH * 0.32} M ${cx} ${cy + halfH * 0.32} Q ${cx - 4} ${cy + halfH * 0.42} ${cx - 8} ${cy + halfH * 0.32} M ${cx} ${cy + halfH * 0.32} Q ${cx + 4} ${cy + halfH * 0.42} ${cx + 8} ${cy + halfH * 0.32}" fill="none" stroke="${STROKE}" stroke-width="1.3" stroke-linecap="round"/>`
    );
}

// ─── Fox ─────────────────────────────────────────────────────────────────

function drawFox(g: AnimalGeo, _fur: string): string {
    const orange = "#D96E2E";
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earBase = halfW * 0.55;

    return (
        // Pointed ears
        `<polygon points="${cx - halfW + 2},${cy - halfH * 0.3} ${cx - halfW + earBase * 0.5},${cy - halfH - earBase} ${cx - halfW + earBase * 1.05},${cy - halfH * 0.1}" fill="${orange}"/>` +
        `<polygon points="${cx + halfW - 2},${cy - halfH * 0.3} ${cx + halfW - earBase * 0.5},${cy - halfH - earBase} ${cx + halfW - earBase * 1.05},${cy - halfH * 0.1}" fill="${orange}"/>` +
        `<polygon points="${cx - halfW + earBase * 0.5},${cy - halfH * 0.2} ${cx - halfW + earBase * 0.7},${cy - halfH - earBase * 0.55} ${cx - halfW + earBase * 0.95},${cy - halfH * 0.15}" fill="${STROKE}"/>` +
        `<polygon points="${cx + halfW - earBase * 0.5},${cy - halfH * 0.2} ${cx + halfW - earBase * 0.7},${cy - halfH - earBase * 0.55} ${cx + halfW - earBase * 0.95},${cy - halfH * 0.15}" fill="${STROKE}"/>` +
        // Head (slightly angular)
        `<path d="M ${cx - halfW} ${cy - halfH * 0.2} Q ${cx - halfW} ${cy + halfH * 0.5} ${cx} ${cy + halfH * 0.65} Q ${cx + halfW} ${cy + halfH * 0.5} ${cx + halfW} ${cy - halfH * 0.2} Q ${cx + halfW * 0.8} ${cy - halfH * 0.6} ${cx} ${cy - halfH * 0.55} Q ${cx - halfW * 0.8} ${cy - halfH * 0.6} ${cx - halfW} ${cy - halfH * 0.2} Z" fill="${orange}"/>` +
        // White muzzle
        `<path d="M ${cx - halfW * 0.45} ${cy + halfH * 0.1} Q ${cx} ${cy + halfH * 0.7} ${cx + halfW * 0.45} ${cy + halfH * 0.1} Q ${cx} ${cy + halfH * 0.35} ${cx - halfW * 0.45} ${cy + halfH * 0.1} Z" fill="${WHITE}"/>` +
        // Eyes
        `<ellipse cx="${cx - halfW * 0.3}" cy="${cy - halfH * 0.1}" rx="${halfW * 0.09}" ry="${halfH * 0.12}" fill="${STROKE}"/>` +
        `<ellipse cx="${cx + halfW * 0.3}" cy="${cy - halfH * 0.1}" rx="${halfW * 0.09}" ry="${halfH * 0.12}" fill="${STROKE}"/>` +
        // Nose
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.22}" rx="${halfW * 0.08}" ry="${halfH * 0.07}" fill="${BLACK}"/>` +
        // Mouth
        `<path d="M ${cx} ${cy + halfH * 0.3} L ${cx} ${cy + halfH * 0.42} M ${cx} ${cy + halfH * 0.42} Q ${cx - 3} ${cy + halfH * 0.48} ${cx - 6} ${cy + halfH * 0.42}" fill="none" stroke="${STROKE}" stroke-width="1.2" stroke-linecap="round"/>`
    );
}

// ─── Panda ───────────────────────────────────────────────────────────────

function drawPanda(g: AnimalGeo, _fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earR = halfW * 0.25;

    return (
        // Black ears
        `<circle cx="${cx - halfW * 0.85}" cy="${cy - halfH * 0.8}" r="${earR}" fill="${BLACK}"/>` +
        `<circle cx="${cx + halfW * 0.85}" cy="${cy - halfH * 0.8}" r="${earR}" fill="${BLACK}"/>` +
        // White head
        `<ellipse cx="${cx}" cy="${cy}" rx="${halfW}" ry="${halfH}" fill="${WHITE}"/>` +
        // Black eye patches
        `<ellipse cx="${cx - halfW * 0.32}" cy="${cy - halfH * 0.05}" rx="${halfW * 0.2}" ry="${halfH * 0.22}" fill="${BLACK}" transform="rotate(-18 ${cx - halfW * 0.32} ${cy - halfH * 0.05})"/>` +
        `<ellipse cx="${cx + halfW * 0.32}" cy="${cy - halfH * 0.05}" rx="${halfW * 0.2}" ry="${halfH * 0.22}" fill="${BLACK}" transform="rotate(18 ${cx + halfW * 0.32} ${cy - halfH * 0.05})"/>` +
        // White eyes
        `<circle cx="${cx - halfW * 0.32}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${WHITE}"/>` +
        `<circle cx="${cx + halfW * 0.32}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${WHITE}"/>` +
        `<circle cx="${cx - halfW * 0.3}" cy="${cy - halfH * 0.03}" r="2" fill="${BLACK}"/>` +
        `<circle cx="${cx + halfW * 0.34}" cy="${cy - halfH * 0.03}" r="2" fill="${BLACK}"/>` +
        // Nose and mouth
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.18}" rx="${halfW * 0.08}" ry="${halfH * 0.05}" fill="${BLACK}"/>` +
        `<path d="M ${cx} ${cy + halfH * 0.22} L ${cx} ${cy + halfH * 0.32} M ${cx} ${cy + halfH * 0.32} Q ${cx - 3} ${cy + halfH * 0.38} ${cx - 6} ${cy + halfH * 0.32} M ${cx} ${cy + halfH * 0.32} Q ${cx + 3} ${cy + halfH * 0.38} ${cx + 6} ${cy + halfH * 0.32}" fill="none" stroke="${BLACK}" stroke-width="1.2" stroke-linecap="round"/>`
    );
}

// ─── Bunny ───────────────────────────────────────────────────────────────

function drawBunny(g: AnimalGeo, fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earW = halfW * 0.2;
    const earH = halfH * 0.9;

    return (
        // Long ears
        `<ellipse cx="${cx - halfW * 0.35}" cy="${cy - halfH * 0.8}" rx="${earW}" ry="${earH}" fill="${fur}" transform="rotate(-10 ${cx - halfW * 0.35} ${cy - halfH * 0.8})"/>` +
        `<ellipse cx="${cx + halfW * 0.35}" cy="${cy - halfH * 0.8}" rx="${earW}" ry="${earH}" fill="${fur}" transform="rotate(10 ${cx + halfW * 0.35} ${cy - halfH * 0.8})"/>` +
        `<ellipse cx="${cx - halfW * 0.35}" cy="${cy - halfH * 0.75}" rx="${earW * 0.5}" ry="${earH * 0.75}" fill="${PINK}" transform="rotate(-10 ${cx - halfW * 0.35} ${cy - halfH * 0.75})"/>` +
        `<ellipse cx="${cx + halfW * 0.35}" cy="${cy - halfH * 0.75}" rx="${earW * 0.5}" ry="${earH * 0.75}" fill="${PINK}" transform="rotate(10 ${cx + halfW * 0.35} ${cy - halfH * 0.75})"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.05}" rx="${halfW}" ry="${halfH * 0.9}" fill="${fur}"/>` +
        // Eyes
        `<circle cx="${cx - halfW * 0.28}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        `<circle cx="${cx + halfW * 0.28}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        // Nose
        `<polygon points="${cx},${cy + halfH * 0.2} ${cx - 3},${cy + halfH * 0.12} ${cx + 3},${cy + halfH * 0.12}" fill="${PINK}"/>` +
        // Teeth
        `<rect x="${cx - 3}" y="${cy + halfH * 0.25}" width="2.5" height="4" fill="${WHITE}" stroke="${STROKE}" stroke-width="0.4"/>` +
        `<rect x="${cx + 0.5}" y="${cy + halfH * 0.25}" width="2.5" height="4" fill="${WHITE}" stroke="${STROKE}" stroke-width="0.4"/>` +
        // Whiskers
        `<line x1="${cx - halfW * 0.2}" y1="${cy + halfH * 0.2}" x2="${cx - halfW * 0.55}" y2="${cy + halfH * 0.18}" stroke="${STROKE}" stroke-width="0.6"/>` +
        `<line x1="${cx + halfW * 0.2}" y1="${cy + halfH * 0.2}" x2="${cx + halfW * 0.55}" y2="${cy + halfH * 0.18}" stroke="${STROKE}" stroke-width="0.6"/>`
    );
}

// ─── Frog ────────────────────────────────────────────────────────────────

function drawFrog(g: AnimalGeo, _fur: string): string {
    const green = "#6FB368";
    const darkGreen = "#4A7A45";
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;

    return (
        // Eye domes on top
        `<circle cx="${cx - halfW * 0.45}" cy="${cy - halfH * 0.55}" r="${halfW * 0.3}" fill="${green}"/>` +
        `<circle cx="${cx + halfW * 0.45}" cy="${cy - halfH * 0.55}" r="${halfW * 0.3}" fill="${green}"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.1}" rx="${halfW * 1.05}" ry="${halfH * 0.85}" fill="${green}"/>` +
        // Eye whites
        `<circle cx="${cx - halfW * 0.45}" cy="${cy - halfH * 0.55}" r="${halfW * 0.22}" fill="${WHITE}"/>` +
        `<circle cx="${cx + halfW * 0.45}" cy="${cy - halfH * 0.55}" r="${halfW * 0.22}" fill="${WHITE}"/>` +
        // Pupils
        `<circle cx="${cx - halfW * 0.45}" cy="${cy - halfH * 0.5}" r="${halfW * 0.1}" fill="${BLACK}"/>` +
        `<circle cx="${cx + halfW * 0.45}" cy="${cy - halfH * 0.5}" r="${halfW * 0.1}" fill="${BLACK}"/>` +
        `<circle cx="${cx - halfW * 0.42}" cy="${cy - halfH * 0.55}" r="2" fill="${WHITE}"/>` +
        `<circle cx="${cx + halfW * 0.48}" cy="${cy - halfH * 0.55}" r="2" fill="${WHITE}"/>` +
        // Wide mouth
        `<path d="M ${cx - halfW * 0.6} ${cy + halfH * 0.25} Q ${cx} ${cy + halfH * 0.55} ${cx + halfW * 0.6} ${cy + halfH * 0.25}" fill="none" stroke="${darkGreen}" stroke-width="2.2" stroke-linecap="round"/>` +
        // Nostrils
        `<circle cx="${cx - 3}" cy="${cy + halfH * 0.05}" r="1" fill="${darkGreen}"/>` +
        `<circle cx="${cx + 3}" cy="${cy + halfH * 0.05}" r="1" fill="${darkGreen}"/>`
    );
}

// ─── Monkey ──────────────────────────────────────────────────────────────

function drawMonkey(g: AnimalGeo, fur: string): string {
    const { cx, cy, headW, headH } = g;
    const halfW = headW / 2;
    const halfH = headH / 2;
    const earR = halfW * 0.25;
    const face = "#F5C99B";

    return (
        // Side ears
        `<circle cx="${cx - halfW - earR * 0.4}" cy="${cy}" r="${earR}" fill="${fur}"/>` +
        `<circle cx="${cx + halfW + earR * 0.4}" cy="${cy}" r="${earR}" fill="${fur}"/>` +
        `<circle cx="${cx - halfW - earR * 0.4}" cy="${cy}" r="${earR * 0.55}" fill="${face}"/>` +
        `<circle cx="${cx + halfW + earR * 0.4}" cy="${cy}" r="${earR * 0.55}" fill="${face}"/>` +
        // Head
        `<ellipse cx="${cx}" cy="${cy}" rx="${halfW}" ry="${halfH}" fill="${fur}"/>` +
        // Face patch
        `<ellipse cx="${cx}" cy="${cy + halfH * 0.15}" rx="${halfW * 0.65}" ry="${halfH * 0.7}" fill="${face}"/>` +
        // Eyes
        `<circle cx="${cx - halfW * 0.25}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        `<circle cx="${cx + halfW * 0.25}" cy="${cy - halfH * 0.05}" r="${halfW * 0.08}" fill="${STROKE}"/>` +
        // Nostrils
        `<circle cx="${cx - 2}" cy="${cy + halfH * 0.2}" r="1" fill="${STROKE}"/>` +
        `<circle cx="${cx + 2}" cy="${cy + halfH * 0.2}" r="1" fill="${STROKE}"/>` +
        // Mouth
        `<path d="M ${cx - halfW * 0.2} ${cy + halfH * 0.38} Q ${cx} ${cy + halfH * 0.48} ${cx + halfW * 0.2} ${cy + halfH * 0.38}" fill="none" stroke="${STROKE}" stroke-width="1.4" stroke-linecap="round"/>`
    );
}

// ─── Assembly ────────────────────────────────────────────────────────────

const RENDERERS: Record<Animal, (g: AnimalGeo, fur: string) => string> = {
    cat: drawCat,
    dog: drawDog,
    bear: drawBear,
    fox: drawFox,
    panda: drawPanda,
    bunny: drawBunny,
    frog: drawFrog,
    monkey: drawMonkey,
};

function createAnimalsContent(options: AnimalsOptions): string {
    const size = options.size ?? 64;
    const random = createRandom(options.seed);
    const animal: Animal = options.animal ?? random.pick(ANIMALS);
    const furTones = options.furTones ?? FUR_TONES;
    const fur = random.pick(furTones);

    return RENDERERS[animal](computeGeo(size), fur);
}

/**
 * Animals avatar style
 *
 * Renders one of eight cute animal faces — cat, dog, bear, fox, panda, bunny,
 * frog, or monkey — each with species-specific ears, muzzle, eyes, and
 * accents. The animal is picked from the seed unless `options.animal` is set.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { animals } from '@avatar-generator/style-animals';
 *
 * const avatar = createAvatar(animals, { seed: 'Hugo GB' });
 * ```
 */
export const animals: Style<AnimalsOptions> = {
    name: "animals",

    create(options: AnimalsOptions): AvatarResult {
        validateOption("animals", "animal", options.animal, ANIMALS);

        const random = createRandom(options.seed);
        const colors = options.colors ?? DEFAULT_COLORS;
        const backgroundColor = random.pick(colors);

        const content = createAnimalsContent(options);
        return buildSvg(content, options, backgroundColor);
    },
};

export default animals;
export type { Animal, AnimalsOptions };
