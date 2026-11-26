import { describe, expect, it } from "vitest";
import {
    HAIR_STYLES as FACES_HAIR_STYLES,
    EYE_STYLES as FACES_EYE_STYLES,
    MOUTH_STYLES as FACES_MOUTH_STYLES,
} from "@avatar-generator/style-faces";
import {
    HAIR_STYLES as ILLUSTRATED_HAIR_STYLES,
    EYE_STYLES as ILLUSTRATED_EYE_STYLES,
    EYEBROW_STYLES as ILLUSTRATED_EYEBROW_STYLES,
    NOSE_STYLES as ILLUSTRATED_NOSE_STYLES,
    MOUTH_STYLES as ILLUSTRATED_MOUTH_STYLES,
} from "@avatar-generator/style-illustrated";
import {
    HAIR_STYLES as ANIME_HAIR_STYLES,
    EYE_STYLES as ANIME_EYE_STYLES,
    MOUTH_STYLES as ANIME_MOUTH_STYLES,
    NOSE_STYLES as ANIME_NOSE_STYLES,
} from "@avatar-generator/style-anime";
import { CENTER_STYLES } from "@avatar-generator/style-rings";
import { COMPOSITIONS as ABSTRACT_COMPOSITIONS } from "@avatar-generator/style-abstract";
import { EXPRESSIONS as EMOJI_EXPRESSIONS } from "@avatar-generator/style-emoji";
import { ANIMALS } from "@avatar-generator/style-animals";
import { DIRECTIONS as GRADIENT_DIRECTIONS, PATTERNS as GRADIENT_PATTERNS } from "@avatar-generator/style-gradient";
import {
    HEAD_SHAPES as ROBOTS_HEAD_SHAPES,
    ANTENNAS as ROBOTS_ANTENNAS,
    EYE_STYLES as ROBOTS_EYE_STYLES,
    MOUTH_STYLES as ROBOTS_MOUTH_STYLES,
    METAL_COLORS as ROBOTS_METAL_COLORS,
} from "@avatar-generator/style-robots";
import {
    HAIR_STYLES as PORTRAITS_HAIR_STYLES,
    EYE_STYLES as PORTRAITS_EYE_STYLES,
    MOUTH_STYLES as PORTRAITS_MOUTH_STYLES,
} from "@avatar-generator/style-portraits";
import {
    BODY_SHAPES as CREATURES_BODY_SHAPES,
    HORNS as CREATURES_HORNS,
    EYE_COUNTS as CREATURES_EYE_COUNTS,
    MOUTH_STYLES as CREATURES_MOUTH_STYLES,
    MARKINGS as CREATURES_MARKINGS,
    BODY_COLORS as CREATURES_BODY_COLORS,
} from "@avatar-generator/style-creatures";
import { SYMBOLS as MARKS_SYMBOLS } from "@avatar-generator/style-marks";

describe("exported style constants", () => {
    const suites: Array<[string, unknown[], number]> = [
        ["faces HAIR_STYLES", FACES_HAIR_STYLES, 8],
        ["faces EYE_STYLES", FACES_EYE_STYLES, 4],
        ["faces MOUTH_STYLES", FACES_MOUTH_STYLES, 5],
        ["illustrated HAIR_STYLES", ILLUSTRATED_HAIR_STYLES, 12],
        ["illustrated EYE_STYLES", ILLUSTRATED_EYE_STYLES, 8],
        ["illustrated EYEBROW_STYLES", ILLUSTRATED_EYEBROW_STYLES, 6],
        ["illustrated NOSE_STYLES", ILLUSTRATED_NOSE_STYLES, 5],
        ["illustrated MOUTH_STYLES", ILLUSTRATED_MOUTH_STYLES, 8],
        ["anime HAIR_STYLES", ANIME_HAIR_STYLES, 10],
        ["anime EYE_STYLES", ANIME_EYE_STYLES, 8],
        ["anime MOUTH_STYLES", ANIME_MOUTH_STYLES, 6],
        ["anime NOSE_STYLES", ANIME_NOSE_STYLES, 3],
        ["rings CENTER_STYLES", CENTER_STYLES, 5],
        ["abstract COMPOSITIONS", ABSTRACT_COMPOSITIONS, 3],
        ["emoji EXPRESSIONS", EMOJI_EXPRESSIONS, 10],
        ["animals ANIMALS", ANIMALS, 8],
        ["gradient DIRECTIONS", GRADIENT_DIRECTIONS, 3],
        ["gradient PATTERNS", GRADIENT_PATTERNS, 5],
        ["robots HEAD_SHAPES", ROBOTS_HEAD_SHAPES, 4],
        ["robots ANTENNAS", ROBOTS_ANTENNAS, 5],
        ["robots EYE_STYLES", ROBOTS_EYE_STYLES, 5],
        ["robots MOUTH_STYLES", ROBOTS_MOUTH_STYLES, 4],
        ["robots METAL_COLORS", ROBOTS_METAL_COLORS, 9],
        ["portraits HAIR_STYLES", PORTRAITS_HAIR_STYLES, 9],
        ["portraits EYE_STYLES", PORTRAITS_EYE_STYLES, 4],
        ["portraits MOUTH_STYLES", PORTRAITS_MOUTH_STYLES, 4],
        ["creatures BODY_SHAPES", CREATURES_BODY_SHAPES, 4],
        ["creatures HORNS", CREATURES_HORNS, 4],
        ["creatures EYE_COUNTS", CREATURES_EYE_COUNTS, 3],
        ["creatures MOUTH_STYLES", CREATURES_MOUTH_STYLES, 4],
        ["creatures MARKINGS", CREATURES_MARKINGS, 3],
        ["creatures BODY_COLORS", CREATURES_BODY_COLORS, 10],
        ["marks SYMBOLS", MARKS_SYMBOLS, 10],
    ];

    it.each(suites)("%s has the expected number of entries", (_name, arr, count) => {
        expect(arr).toHaveLength(count);
    });

    it.each(suites)("%s entries are unique", (_name, arr) => {
        expect(new Set(arr).size).toBe(arr.length);
    });
});
