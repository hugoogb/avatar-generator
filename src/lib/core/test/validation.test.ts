import { describe, expect, it } from "vitest";
import { validateOption } from "@avatar-generator/core";

const COLORS = ["red", "green", "blue"] as const;

describe("validateOption", () => {
    it("returns silently for undefined (user opted into random selection)", () => {
        expect(() => validateOption("test", "color", undefined, COLORS)).not.toThrow();
    });

    it("returns silently for a valid value", () => {
        expect(() => validateOption("test", "color", "red", COLORS)).not.toThrow();
    });

    it("throws when the value is not in the valid list", () => {
        expect(() => validateOption("test", "color", "purple", COLORS)).toThrow(/Invalid color/);
    });

    it("includes the style name in the error", () => {
        expect(() => validateOption("my-style", "color", "purple", COLORS)).toThrow(
            /@avatar-generator\/style-my-style/,
        );
    });

    it("includes the invalid value in the error", () => {
        expect(() => validateOption("test", "color", "purple", COLORS)).toThrow(/"purple"/);
    });

    it("lists all valid values in the error", () => {
        expect(() => validateOption("test", "color", "purple", COLORS)).toThrow(/"red", "green", "blue"/);
    });
});
