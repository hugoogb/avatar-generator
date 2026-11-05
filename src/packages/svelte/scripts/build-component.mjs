/**
 * Compiles the TypeScript out of each component and writes plain-JS components
 * to dist/.
 *
 * The package ships the raw `.svelte` file (resolved via the `svelte` export
 * condition) so the consumer's own Svelte compiler handles it. That compiler
 * does not understand `lang="ts"` unless the consumer has configured a
 * preprocessor — which a library must never require. So the types are stripped
 * here, at publish time, exactly as `svelte-package` would do it.
 */
import { transformSync } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = /<script([^>]*)\blang=["']ts["']([^>]*)>([\s\S]*?)<\/script>/g;

for (const file of ["Avatar.svelte", "AvatarGroup.svelte"]) {
    const source = join(pkgRoot, "src", file);
    const target = join(pkgRoot, "dist", file);

    let found = 0;
    const compiled = readFileSync(source, "utf8").replace(SCRIPT, (_match, before, after, body) => {
        found++;
        // No `format` here on purpose: setting it makes esbuild normalise the
        // module and rewrite `export let prop` into a trailing export list, which
        // is not how Svelte declares props. Left unset, only the types come out.
        //
        // `verbatimModuleSyntax` keeps value imports esbuild cannot see being
        // used: the markup is what reads them, and it is not part of this script.
        const { code } = transformSync(body, {
            loader: "ts",
            target: "es2020",
            tsconfigRaw: { compilerOptions: { verbatimModuleSyntax: true } },
        });
        const attrs = `${before}${after}`.trim();
        return `<script${attrs ? ` ${attrs}` : ""}>\n${code.trimEnd()}\n</script>`;
    });

    if (found === 0) {
        throw new Error(`${source} has no <script lang="ts"> block — did the component change shape?`);
    }
    if (/\blang=["']ts["']/.test(compiled)) {
        throw new Error('lang="ts" survived preprocessing; the published component would not compile for consumers');
    }

    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, compiled);
    console.log(`${file} -> dist/${file} (TypeScript stripped from ${found} script block)`);
}
