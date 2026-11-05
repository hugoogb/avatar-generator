import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { version } from "../package.json";
import { TEMPLATES, type TemplateContext, type TemplateName } from "./templates";

export { TEMPLATES };
export type { StyleTemplate, TemplateContext, TemplateName } from "./templates";

/** Options for {@link scaffold}. */
export interface ScaffoldOptions {
    /** npm package name, such as `my-style` or `@acme/avatar-style-cool`. */
    name: string;
    /** Starting point (default: `minimal`). */
    template?: TemplateName;
    /** Target directory (default: the unscoped name, under the working directory). */
    directory?: string;
}

/** What {@link scaffold} wrote. */
export interface ScaffoldResult {
    /** Absolute path of the new package. */
    directory: string;
    /** Paths written, relative to `directory`. */
    files: string[];
}

// From npm's rules for new packages. It also rules out path traversal and
// anything that would need escaping in the generated source.
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;

const RESERVED = new Set(
    (
        "arguments await break case catch class const continue debugger default delete do else enum eval export extends " +
        "false finally for function if implements import in instanceof interface let new null package private protected " +
        "public return static super switch this throw true try typeof var void while with yield"
    ).split(" "),
);

/** Derives the names a template needs from a package name. */
export function deriveNames(packageName: string): TemplateContext {
    const unscoped = packageName.split("/").pop() ?? packageName;
    const styleName = unscoped.replace(/^(?:avatar-)?style-/, "").replace(/-style$/, "") || unscoped;

    const words = styleName.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    const camel = words.map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1))).join("");
    const safe = /^[0-9]/.test(camel) ? `style${camel}` : camel;
    const exportName = RESERVED.has(safe) ? `${safe}Style` : safe;

    return {
        packageName,
        styleName,
        exportName,
        typeName: exportName[0].toUpperCase() + exportName.slice(1),
    };
}

const json = (value: unknown): string => `${JSON.stringify(value, null, 4)}\n`;

function projectFiles(context: TemplateContext, template: TemplateName): Record<string, string> {
    const { packageName, styleName, exportName } = context;

    return {
        "package.json": json({
            name: packageName,
            version: "0.1.0",
            description: `${styleName} avatar style for @avatar-generator`,
            keywords: ["avatar", "avatar-generator", "svg"],
            license: "MIT",
            type: "module",
            main: "./dist/index.cjs",
            module: "./dist/index.js",
            types: "./dist/index.d.ts",
            exports: {
                ".": {
                    import: { types: "./dist/index.d.ts", default: "./dist/index.js" },
                    require: { types: "./dist/index.d.cts", default: "./dist/index.cjs" },
                },
                "./package.json": "./package.json",
            },
            files: ["dist"],
            sideEffects: false,
            scripts: {
                build: "tsup src/index.ts --format esm,cjs --dts --clean",
                test: "vitest run",
                typecheck: "tsc --noEmit",
            },
            dependencies: { "@avatar-generator/core": `^${version}` },
            devDependencies: { tsup: "^8.5.0", typescript: "^5.7.2", vitest: "^2.1.9" },
        }),
        "tsconfig.json": json({
            compilerOptions: {
                target: "es2020",
                module: "esnext",
                moduleResolution: "bundler",
                strict: true,
                declaration: true,
                skipLibCheck: true,
                noEmit: true,
            },
            include: ["src", "test"],
        }),
        ".gitignore": "node_modules\ndist\n",
        "README.md": `# ${packageName}

The ${styleName} style for [@avatar-generator](https://avatar-generator.hugoogb.dev/).

\`\`\`ts
import { createAvatar } from "@avatar-generator/core";
import { ${exportName} } from "${packageName}";

const avatar = createAvatar(${exportName}, { seed: "user-42", size: 64 });
\`\`\`
`,
        "src/index.ts": TEMPLATES[template].source(context),
        "test/index.test.ts": `import { createAvatar } from "@avatar-generator/core";
import { describe, expect, it } from "vitest";
import { ${exportName} } from "../src/index";

describe("${styleName}", () => {
    it("produces an SVG", () => {
        expect(createAvatar(${exportName}, { seed: "user-42" }).svg).toMatch(/^<svg /);
    });

    it("is deterministic", () => {
        const first = createAvatar(${exportName}, { seed: "user-42" }).svg;
        expect(createAvatar(${exportName}, { seed: "user-42" }).svg).toBe(first);
    });

    it("varies with the seed", () => {
        const seeds = Array.from({ length: 20 }, (_, i) => createAvatar(${exportName}, { seed: \`seed-\${i}\` }).svg);
        expect(new Set(seeds).size).toBeGreaterThan(1);
    });
});
`,
    };
}

/**
 * Writes a new style package to disk.
 *
 * @throws If the name is invalid, the template is unknown, or the target
 * directory already has files in it. Nothing is written in those cases.
 */
export function scaffold({ name, template = "minimal", directory }: ScaffoldOptions): ScaffoldResult {
    if (!PACKAGE_NAME.test(name) || name.length > 214) {
        throw new Error(`Invalid package name: ${JSON.stringify(name)}. Use lowercase letters, digits, - . and _.`);
    }
    if (!Object.prototype.hasOwnProperty.call(TEMPLATES, template)) {
        const valid = Object.keys(TEMPLATES).join(", ");
        throw new Error(`Unknown template: ${JSON.stringify(template)}. Expected one of: ${valid}.`);
    }

    const target = resolve(directory ?? basename(name));
    if (existsSync(target) && readdirSync(target).length > 0) {
        throw new Error(`${target} already exists and is not empty.`);
    }

    const files = projectFiles(deriveNames(name), template);
    for (const [path, contents] of Object.entries(files)) {
        const destination = join(target, path);
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, contents);
    }

    return { directory: target, files: Object.keys(files) };
}
