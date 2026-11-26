/**
 * Every published style, imported from the packages' own source (see the
 * aliases in astro.config.mjs), so the gallery, playground and configurator
 * show exactly what `createAvatar` produces for a user.
 */
import type { AvatarOptions, Style } from "@avatar-generator/core";
import { abstract, COMPOSITIONS } from "@avatar-generator/style-abstract";
import { ANIMALS, animals } from "@avatar-generator/style-animals";
import {
    anime,
    EYE_STYLES as ANIME_EYES,
    HAIR_STYLES as ANIME_HAIR,
    MOUTH_STYLES as ANIME_MOUTHS,
    NOSE_STYLES as ANIME_NOSES,
} from "@avatar-generator/style-anime";
import {
    BODY_SHAPES,
    creatures,
    EYE_COUNTS,
    HORNS,
    MARKINGS,
    MOUTH_STYLES as CREATURE_MOUTHS,
} from "@avatar-generator/style-creatures";
import { emoji, EXPRESSIONS } from "@avatar-generator/style-emoji";
import {
    EYE_STYLES as FACES_EYES,
    faces,
    HAIR_STYLES as FACES_HAIR,
    MOUTH_STYLES as FACES_MOUTHS,
} from "@avatar-generator/style-faces";
import { geometric } from "@avatar-generator/style-geometric";
import { DIRECTIONS, gradient, PATTERNS } from "@avatar-generator/style-gradient";
import {
    EYE_STYLES as ILLUSTRATED_EYES,
    EYEBROW_STYLES as ILLUSTRATED_BROWS,
    HAIR_STYLES as ILLUSTRATED_HAIR,
    illustrated,
    MOUTH_STYLES as ILLUSTRATED_MOUTHS,
    NOSE_STYLES as ILLUSTRATED_NOSES,
} from "@avatar-generator/style-illustrated";
import { initials } from "@avatar-generator/style-initials";
import { marks, SYMBOLS } from "@avatar-generator/style-marks";
import { pixels } from "@avatar-generator/style-pixels";
import {
    EYE_STYLES as PORTRAIT_EYES,
    HAIR_STYLES as PORTRAIT_HAIR,
    MOUTH_STYLES as PORTRAIT_MOUTHS,
    portraits,
} from "@avatar-generator/style-portraits";
import { CENTER_STYLES, rings } from "@avatar-generator/style-rings";
import {
    ANTENNAS,
    EYE_STYLES as ROBOT_EYES,
    HEAD_SHAPES,
    MOUTH_STYLES as ROBOT_MOUTHS,
    robots,
} from "@avatar-generator/style-robots";

/** A value an option can take in the configurator. */
export type Choice = string | number | boolean;

export interface StyleEntry {
    /** Export and package suffix, e.g. `faces` for `@avatar-generator/style-faces`. */
    name: string;
    label: string;
    description: string;
    style: Style<AvatarOptions>;
    /** Options the configurator offers, with every value each one accepts. */
    choices: Record<string, readonly Choice[]>;
}

const BOOL = [true, false] as const;
const entry = (
    name: string,
    label: string,
    description: string,
    style: unknown,
    choices: StyleEntry["choices"] = {},
): StyleEntry => ({ name, label, description, style: style as Style<AvatarOptions>, choices });

export const STYLES: StyleEntry[] = [
    entry("initials", "Initials", "Letter initials on colored backgrounds", initials),
    entry("geometric", "Geometric", "GitHub-style symmetrical identicon grids", geometric),
    entry("pixels", "Pixels", "8-bit retro pixel faces", pixels),
    entry("rings", "Rings", "Concentric rings, segmented and dashed variants", rings, { centerStyle: CENTER_STYLES }),
    entry("faces", "Faces", "Minimal flat geometric faces", faces, {
        hairStyle: FACES_HAIR,
        eyeStyle: FACES_EYES,
        mouthStyle: FACES_MOUTHS,
    }),
    entry("illustrated", "Illustrated", "Detailed cartoon faces with accessories", illustrated, {
        hairStyle: ILLUSTRATED_HAIR,
        eyeStyle: ILLUSTRATED_EYES,
        eyebrowStyle: ILLUSTRATED_BROWS,
        noseStyle: ILLUSTRATED_NOSES,
        mouthStyle: ILLUSTRATED_MOUTHS,
        glasses: BOOL,
        hat: BOOL,
        facialHair: BOOL,
    }),
    entry("anime", "Anime", "Anime/manga-inspired faces with expressive eyes", anime, {
        hairStyle: ANIME_HAIR,
        eyeStyle: ANIME_EYES,
        noseStyle: ANIME_NOSES,
        mouthStyle: ANIME_MOUTHS,
    }),
    entry("abstract", "Abstract", "Mondrian/Kandinsky/Bauhaus-inspired compositions", abstract, {
        composition: COMPOSITIONS,
    }),
    entry("emoji", "Emoji", "Yellow emoji-style expressive faces", emoji, { expression: EXPRESSIONS }),
    entry("animals", "Animals", "Cute animal avatars (cat, dog, fox, panda, …)", animals, { animal: ANIMALS }),
    entry("gradient", "Gradient", "Smooth gradients with pattern overlays", gradient, {
        direction: DIRECTIONS,
        pattern: PATTERNS,
    }),
    entry("robots", "Robots", "Robots for bots, AI agents and service accounts", robots, {
        headShape: HEAD_SHAPES,
        antenna: ANTENNAS,
        eyeStyle: ROBOT_EYES,
        mouthStyle: ROBOT_MOUTHS,
    }),
    entry("portraits", "Portraits", "Single-colour ink portraits for professional tools", portraits, {
        hairStyle: PORTRAIT_HAIR,
        eyeStyle: PORTRAIT_EYES,
        mouthStyle: PORTRAIT_MOUTHS,
        glasses: BOOL,
        facialHair: BOOL,
    }),
    entry("creatures", "Creatures", "Friendly made-up monsters", creatures, {
        bodyShape: BODY_SHAPES,
        horns: HORNS,
        eyes: EYE_COUNTS,
        mouthStyle: CREATURE_MOUTHS,
        markings: MARKINGS,
    }),
    entry("marks", "Marks", "Logo-like badges for teams and organisations", marks, {
        symbol: SYMBOLS,
        letter: BOOL,
    }),
];
