/**
 * Post-build fixes to the package ng-packagr generates.
 *
 * 1. `publishConfig.directory` is copied verbatim into the generated manifest.
 *    That key tells pnpm where to pack *from*; inside the published package it
 *    is meaningless and would point a re-publish at a dist/ that is not there.
 *
 * 2. ng-packagr emits one `.d.ts` per source file with extensionless relative
 *    re-exports (`export * from "./Avatar.component"`). Extensionless
 *    specifiers are not valid ESM, so a consumer on `moduleResolution:
 *    "node16"` or `"nodenext"` cannot resolve the types — TypeScript even
 *    treats `.component` as the extension and looks for `Avatar.d.component.ts`.
 *    Angular CLI applications use `"bundler"` resolution and never notice,
 *    which is why ng-packagr gets away with it, but everyone else does.
 *
 *    Rewriting the specifiers here rather than in the source is deliberate:
 *    ng-packagr's FESM bundling step cannot resolve explicit `.js` specifiers
 *    (its intermediate files are `.mjs`), so the source has to stay
 *    extensionless and the declarations have to be corrected afterwards.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");

// ---- 1. manifest -----------------------------------------------------------
const manifestPath = join(dist, "package.json");
const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));

if (pkg.publishConfig?.directory) {
    delete pkg.publishConfig.directory;
    if (Object.keys(pkg.publishConfig).length === 0) delete pkg.publishConfig;
    writeFileSync(manifestPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("dist/package.json: dropped publishConfig.directory");
}

// ---- 2. declaration specifiers --------------------------------------------
const declarations = readdirSync(dist).filter((f) => f.endsWith(".d.ts"));
const RELATIVE_SPECIFIER = /((?:^|\n)\s*(?:export|import)\s[^;\n]*?from\s*["'])(\.\.?\/[^"']+)(["'])/g;

let rewritten = 0;
for (const file of declarations) {
    const path = join(dist, file);
    const before = readFileSync(path, "utf8");

    const after = before.replace(RELATIVE_SPECIFIER, (match, head, specifier, tail) =>
        specifier.endsWith(".js") ? match : `${head}${specifier}.js${tail}`,
    );

    if (after !== before) {
        writeFileSync(path, after);
        rewritten++;
    }
}

if (rewritten > 0) {
    console.log(`dist: added .js to relative specifiers in ${rewritten} declaration file(s)`);
}

// Fail the build rather than publish declarations Node cannot resolve.
for (const file of declarations) {
    const content = readFileSync(join(dist, file), "utf8");
    const offenders = [...content.matchAll(RELATIVE_SPECIFIER)].filter(([, , specifier]) => !specifier.endsWith(".js"));
    if (offenders.length > 0) {
        throw new Error(
            `${file} still has extensionless relative specifiers: ${offenders.map((m) => m[2]).join(", ")}`,
        );
    }
}
