import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Core must not know which styles exist.
 *
 * It used to: `types.ts` declared `FacesOptions`, `AnimeOptions`,
 * `AnimalsOptions` and the rest, so every new style meant editing core, which
 * meant releasing core, which is the opposite of the independent, tree-shakeable
 * packages this project advertises — and it made a third-party style impossible
 * to type. Option types now live in the package that implements them.
 *
 * This test reads the source rather than the compiled output because types are
 * erased at runtime: there is nothing left to assert against afterwards.
 */
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

const declaredTypes = (file: string): string[] =>
    [...readFileSync(join(SRC, file), "utf8").matchAll(/^export (?:interface|type) (\w+)/gm)].map((m) => m[1]);

/** The vocabulary of the Style contract itself — nothing style-specific. */
const CORE_TYPES = ["Random", "AvatarResult", "AvatarOptions", "Style", "LegacyAvatarOptions"];

const STYLE_NAMES = [
    "initials",
    "geometric",
    "pixels",
    "rings",
    "faces",
    "illustrated",
    "anime",
    "abstract",
    "emoji",
    "animals",
    "gradient",
];

describe("core type boundary", () => {
    it("declares only the shared Style contract", () => {
        expect(declaredTypes("types.ts").sort()).toEqual([...CORE_TYPES].sort());
    });

    it("declares no type named after a style", () => {
        const offenders = declaredTypes("types.ts").filter((name) =>
            STYLE_NAMES.some((style) => name.toLowerCase().startsWith(style)),
        );

        expect(offenders).toEqual([]);
    });

    it("imports nothing from a style package", () => {
        // A style depends on core, so core importing back would be a cycle.
        // Only real import/export statements count — JSDoc examples and the
        // `[@avatar-generator/style-x]` prefix in validation errors are fine.
        const importsAStyle = /(?:^\s*(?:import|export)[^;]*?from\s*|\bimport\s*\(\s*)["']@avatar-generator\/style-/m;

        for (const file of ["index.ts", "types.ts", "svg.ts", "random.ts", "validation.ts"]) {
            expect(readFileSync(join(SRC, file), "utf8")).not.toMatch(importsAStyle);
        }
    });
});
