import { describe, expectTypeOf, it } from "vitest";
import type {
    AnimeOptions,
    AvatarOptions,
    AvatarResult,
    FacesOptions,
    GeometricOptions,
    IllustratedOptions,
    InitialsOptions,
    PixelsOptions,
    Random,
    RingsOptions,
    Style,
} from "@avatar-generator/core";
import { createAvatar, createRandom } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";
import { faces } from "@avatar-generator/style-faces";
import { illustrated } from "@avatar-generator/style-illustrated";
import { anime } from "@avatar-generator/style-anime";

describe("AvatarOptions", () => {
    it("requires a seed", () => {
        expectTypeOf<AvatarOptions>().toHaveProperty("seed").toEqualTypeOf<string>();
    });

    it("marks visual options as optional", () => {
        expectTypeOf<AvatarOptions>().toHaveProperty("size").toEqualTypeOf<number | undefined>();
        expectTypeOf<AvatarOptions>().toHaveProperty("transparent").toEqualTypeOf<boolean | undefined>();
        expectTypeOf<AvatarOptions>().toHaveProperty("square").toEqualTypeOf<boolean | undefined>();
    });
});

describe("style option interfaces extend AvatarOptions", () => {
    it("every style's options include the base AvatarOptions shape", () => {
        expectTypeOf<InitialsOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<GeometricOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<PixelsOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<RingsOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<FacesOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<IllustratedOptions>().toMatchTypeOf<AvatarOptions>();
        expectTypeOf<AnimeOptions>().toMatchTypeOf<AvatarOptions>();
    });
});

describe("RingsOptions.centerStyle", () => {
    it("is a literal union", () => {
        expectTypeOf<RingsOptions>()
            .toHaveProperty("centerStyle")
            .toEqualTypeOf<"solid" | "dot" | "ring" | "diamond" | "none" | undefined>();
    });
});

describe("Style<T>", () => {
    it("create accepts T and returns an AvatarResult", () => {
        expectTypeOf<Style<InitialsOptions>["create"]>().parameters.toEqualTypeOf<[InitialsOptions]>();
        expectTypeOf<Style<InitialsOptions>["create"]>().returns.toEqualTypeOf<AvatarResult>();
    });

    it("exposes a name string", () => {
        expectTypeOf<Style<InitialsOptions>>().toHaveProperty("name").toEqualTypeOf<string>();
    });
});

describe("Random", () => {
    it("createRandom returns the Random interface", () => {
        expectTypeOf(createRandom).returns.toEqualTypeOf<Random>();
    });

    it("exposes next/int/pick/bool/shuffle", () => {
        expectTypeOf<Random["next"]>().toEqualTypeOf<() => number>();
        expectTypeOf<Random["int"]>().toEqualTypeOf<(min: number, max: number) => number>();
        expectTypeOf<Random["bool"]>().toEqualTypeOf<(probability?: number) => boolean>();
    });
});

describe("createAvatar", () => {
    it("returns an AvatarResult", () => {
        expectTypeOf(createAvatar(initials, { seed: "x" })).toEqualTypeOf<AvatarResult>();
    });

    it("rejects options that are missing the required seed", () => {
        // Type-only — never executed. TypeScript must flag the missing seed.
        const _compileCheck = (): void => {
            // @ts-expect-error seed is required
            createAvatar(initials, {});
        };
        void _compileCheck;
    });

    it("narrows options to the style-specific shape", () => {
        expectTypeOf(createAvatar<FacesOptions>).parameters.toEqualTypeOf<[Style<FacesOptions>, FacesOptions]>();
    });

    it("accepts each bundled style", () => {
        createAvatar(initials, { seed: "x" });
        createAvatar(geometric, { seed: "x" });
        createAvatar(pixels, { seed: "x" });
        createAvatar(rings, { seed: "x" });
        createAvatar(faces, { seed: "x" });
        createAvatar(illustrated, { seed: "x" });
        createAvatar(anime, { seed: "x" });
    });
});
