import { createAvatar, mixStyles, type ComposableStyle } from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import { deriveNames, scaffold, TEMPLATES, type TemplateName } from "create-avatar-style";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let root: string;
beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "scaffold-test-"));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("deriveNames", () => {
    it.each([
        ["my-style", "my", "my", "My"],
        ["style-cool", "cool", "cool", "Cool"],
        ["@acme/avatar-style-cool-cats", "cool-cats", "coolCats", "CoolCats"],
        ["new", "new", "newStyle", "NewStyle"],
        ["3d", "3d", "style3d", "Style3d"],
    ])("%s", (name, styleName, exportName, typeName) => {
        expect(deriveNames(name)).toMatchObject({ styleName, exportName, typeName });
    });
});

describe("scaffold", () => {
    it("writes a complete package", () => {
        const directory = join(root, "x");
        const { files } = scaffold({ name: "my-style", directory });
        expect(files.sort()).toEqual(
            [".gitignore", "README.md", "package.json", "src/index.ts", "test/index.test.ts", "tsconfig.json"].sort(),
        );
    });

    it("depends on the matching core release", () => {
        const directory = join(root, "x");
        scaffold({ name: "my-style", directory });
        const own = readJson(join(__dirname, "../package.json")).version;
        expect(readJson(join(directory, "package.json")).dependencies).toEqual({
            "@avatar-generator/core": `^${own}`,
        });
    });

    it.each(["../evil", "UPPER", "a/b", "@/x", "", "a b", 'x"y'])("rejects the name %j", (name) => {
        expect(() => scaffold({ name, directory: join(root, "x") })).toThrow(/Invalid package name/);
    });

    it.each(["nope", "constructor"])("rejects the template %j", (template) => {
        expect(() =>
            scaffold({ name: "my-style", template: template as TemplateName, directory: join(root, "x") }),
        ).toThrow(/Unknown template/);
    });

    it("refuses a non-empty directory and leaves it alone", () => {
        const directory = join(root, "x");
        mkdirSync(directory);
        writeFileSync(join(directory, "keep.txt"), "mine");
        expect(() => scaffold({ name: "my-style", directory })).toThrow(/not empty/);
        expect(readFileSync(join(directory, "keep.txt"), "utf8")).toBe("mine");
    });

    it("accepts an existing empty directory", () => {
        const directory = join(root, "x");
        mkdirSync(directory);
        expect(() => scaffold({ name: "my-style", directory })).not.toThrow();
    });
});

/**
 * The generated source is executed, not just inspected: a template that does
 * not compile or draw would otherwise only be found by the first person to use
 * it, long after release. Generated files import core by its package name, which
 * this repo's Vitest config resolves to the source.
 */
describe.each(Object.keys(TEMPLATES) as TemplateName[])("the %s template", (template) => {
    const load = async () => {
        const directory = join(root, "generated");
        scaffold({ name: "@acme/style-cool-cats", template, directory });
        const module = (await import(/* @vite-ignore */ join(directory, "src/index.ts"))) as {
            coolCats: ComposableStyle;
            default: ComposableStyle;
        };
        return module;
    };

    it("exports a working, deterministic style", async () => {
        const { coolCats, default: fallback } = await load();
        expect(fallback).toBe(coolCats);
        expect(coolCats.name).toBe("cool-cats");

        const { svg } = createAvatar(coolCats, { seed: "x" });
        expect(svg).toMatch(/^<svg /);
        expect(svg).not.toContain("undefined");
        expect(createAvatar(coolCats, { seed: "x" }).svg).toBe(svg);
    });

    it("varies with the seed", async () => {
        const { coolCats } = await load();
        const results = Array.from({ length: 30 }, (_, i) => createAvatar(coolCats, { seed: `s${i}` }).svg);
        expect(new Set(results).size).toBeGreaterThan(1);
    });
});

describe("the face template", () => {
    it("trades features with the bundled face styles", async () => {
        const directory = join(root, "generated");
        scaffold({ name: "cool", template: "face", directory });
        const { cool } = (await import(/* @vite-ignore */ join(directory, "src/index.ts"))) as {
            cool: ComposableStyle;
        };

        const mixed = mixStyles(faces, { eyes: cool });
        expect(createAvatar(mixed, { seed: "x" }).svg).toMatch(/^<svg /);
        expect(createAvatar(mixStyles(cool, { hair: faces }), { seed: "x" }).svg).not.toContain("undefined");
    });

    it("blinks", async () => {
        const directory = join(root, "generated");
        scaffold({ name: "cool", template: "face", directory });
        const { cool } = (await import(/* @vite-ignore */ join(directory, "src/index.ts"))) as {
            cool: ComposableStyle;
        };
        expect(createAvatar(cool, { seed: "x", animation: "blink" }).svg).toContain("ag-layer-eyes");
    });
});
