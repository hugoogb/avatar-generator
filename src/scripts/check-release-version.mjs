/**
 * Asserts that every publishable package sits at the version being released.
 *
 * The release workflow fires on a `v*` tag, and the tag is the only thing that
 * says which version is going out. If it disagrees with the manifests, npm
 * publishes whatever the manifests say — under a git tag that now points at the
 * wrong tree. npm publishes cannot be undone, so this runs before publish, not
 * after.
 *
 *     node scripts/check-release-version.mjs 2.6.1
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGE_DIRS = [
    "lib/core",
    ...[
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
    ].map((s) => `lib/styles/${s}`),
    ...["react", "angular", "vue", "svelte", "web-component"].map((p) => `packages/${p}`),
];

const expected = process.argv[2]?.trim();
if (!expected) {
    console.error("usage: check-release-version.mjs <version>   (e.g. 2.6.1, from the v2.6.1 tag)");
    process.exit(1);
}

const mismatches = [];
for (const dir of PACKAGE_DIRS) {
    const pkg = JSON.parse(readFileSync(join(SRC, dir, "package.json"), "utf8"));
    if (pkg.version !== expected) mismatches.push(`${pkg.name}: ${pkg.version}`);
}

if (mismatches.length > 0) {
    console.error(`Tag says ${expected}, but these packages disagree:\n  ${mismatches.join("\n  ")}`);
    console.error("\nRun `pnpm changeset version` and commit the result before tagging.");
    process.exit(1);
}

console.log(`All ${PACKAGE_DIRS.length} packages are at ${expected}.`);
