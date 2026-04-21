import { describe, expect, it } from "vitest";
import type { AvatarOptions, AvatarResult, Style } from "@avatar-generator/core";
import { createAvatar } from "@avatar-generator/core";

interface TestOptions extends AvatarOptions {
    label?: string;
}

describe("createAvatar", () => {
    it("delegates to the style.create with defaults applied", () => {
        let received: TestOptions | undefined;
        const style: Style<TestOptions> = {
            name: "test",
            create(options) {
                received = options;
                return { svg: "<svg/>", toDataUri: () => "data:" };
            },
        };

        createAvatar(style, { seed: "x" });

        expect(received).toMatchObject({
            seed: "x",
            size: 64,
            square: false,
            transparent: false,
            rotate: 0,
            flip: false,
            scale: 1,
        });
    });

    it("passes user options through without losing custom properties", () => {
        let received: TestOptions | undefined;
        const style: Style<TestOptions> = {
            name: "test",
            create(options) {
                received = options;
                return { svg: "<svg/>", toDataUri: () => "data:" };
            },
        };

        createAvatar(style, { seed: "x", size: 128, label: "custom" });

        expect(received?.size).toBe(128);
        expect(received?.label).toBe("custom");
    });

    it("returns the AvatarResult produced by the style", () => {
        const expected: AvatarResult = { svg: "<svg><!-- from style --></svg>", toDataUri: () => "data:abc" };
        const style: Style<TestOptions> = {
            name: "test",
            create: () => expected,
        };

        expect(createAvatar(style, { seed: "x" })).toBe(expected);
    });
});
