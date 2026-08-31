import { describe, expect, it } from "vitest";
import { createAvatar } from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import { illustrated } from "@avatar-generator/style-illustrated";
import { anime } from "@avatar-generator/style-anime";
import { rings } from "@avatar-generator/style-rings";

describe("style-level validation", () => {
    it("faces rejects invalid hairStyle", () => {
        expect(() =>
            createAvatar(faces, {
                seed: "x",
                // @ts-expect-error invalid hair style
                hairStyle: "spaghetti",
            }),
        ).toThrow(/style-faces.*hairStyle.*spaghetti/);
    });

    it("illustrated rejects invalid eyeStyle", () => {
        expect(() =>
            createAvatar(illustrated, {
                seed: "x",
                // @ts-expect-error invalid eye style
                eyeStyle: "cosmic",
            }),
        ).toThrow(/style-illustrated.*eyeStyle/);
    });

    it("anime rejects invalid mouthStyle", () => {
        expect(() =>
            createAvatar(anime, {
                seed: "x",
                // @ts-expect-error invalid mouth style
                mouthStyle: "tongue-out",
            }),
        ).toThrow(/style-anime.*mouthStyle/);
    });

    it("rings rejects invalid centerStyle", () => {
        expect(() =>
            createAvatar(rings, {
                seed: "x",
                // @ts-expect-error invalid center style
                centerStyle: "triangle",
            }),
        ).toThrow(/style-rings.*centerStyle/);
    });

    it("faces accepts omitted overrides", () => {
        expect(() => createAvatar(faces, { seed: "x" })).not.toThrow();
    });

    it("illustrated accepts valid overrides", () => {
        expect(() => createAvatar(illustrated, { seed: "x", hairStyle: "bald", mouthStyle: "smile" })).not.toThrow();
    });
});
