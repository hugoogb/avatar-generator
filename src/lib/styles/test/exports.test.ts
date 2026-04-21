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
    ];

    it.each(suites)("%s has the expected number of entries", (_name, arr, count) => {
        expect(arr).toHaveLength(count);
    });

    it.each(suites)("%s entries are unique", (_name, arr) => {
        expect(new Set(arr).size).toBe(arr.length);
    });
});
