/**
 * Confirms every package actually landed on the registry at the expected
 * version, after publishing.
 *
 * A publish loop that reports success still leaves room for a half-released
 * scope — a rate limit, a missing trusted publisher on one package, a registry
 * hiccup. Since npm publishes cannot be undone, it is worth knowing immediately
 * which packages are live and which are not, rather than finding out from a
 * consumer whose install cannot resolve a peer.
 *
 *   node scripts/verify-published.mjs 3.0.0
 */
import { execFileSync } from "node:child_process";
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
    console.error("usage: verify-published.mjs <version>   (e.g. 3.0.0)");
    process.exit(1);
}

const names = PACKAGE_DIRS.map((dir) => JSON.parse(readFileSync(join(SRC, dir, "package.json"), "utf8")).name);

const missing = [];

for (const name of names) {
    try {
        const version = execFileSync("npm", ["view", `${name}@${expected}`, "version"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        }).trim();

        if (version === expected) {
            console.log(`  ✓ ${name}@${version}`);
        } else {
            missing.push(`${name} (registry reports ${version || "nothing"})`);
            console.error(`  ✗ ${name} — expected ${expected}, got ${version || "nothing"}`);
        }
    } catch {
        missing.push(`${name} (not found)`);
        console.error(`  ✗ ${name}@${expected} not found on the registry`);
    }
}

if (missing.length > 0) {
    console.error(`\n${names.length - missing.length}/${names.length} published. Missing:`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
}

console.log(`\nAll ${names.length} packages are live at ${expected}.`);
