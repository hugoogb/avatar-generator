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

/**
 * npm's write path and its read path are not instantly consistent. A package
 * can be published and still be absent from a read seconds later — this check
 * once reported two packages missing that were in fact already live, and they
 * appeared a few minutes afterwards with nothing having republished them.
 *
 * `--prefer-online` alone is not enough, because the lag is on the registry
 * side rather than in the local cache. So give it time before concluding a
 * package is missing: a wrong "missing" here sends someone chasing a
 * publishing failure that never happened.
 */
const ATTEMPTS = 5;
const BACKOFF_MS = 15_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const publishedVersion = (name) => {
    try {
        return execFileSync("npm", ["view", `${name}@${expected}`, "version", "--prefer-online"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        }).trim();
    } catch {
        return "";
    }
};

let pending = [...names];
const missing = [];

for (let attempt = 1; attempt <= ATTEMPTS && pending.length > 0; attempt++) {
    if (attempt > 1) {
        console.log(`\n  ${pending.length} not visible yet; waiting ${BACKOFF_MS / 1000}s for the registry…\n`);
        await sleep(BACKOFF_MS);
    }

    const stillPending = [];
    for (const name of pending) {
        const version = publishedVersion(name);
        if (version === expected) {
            console.log(`  ✓ ${name}@${version}`);
        } else {
            stillPending.push(name);
        }
    }
    pending = stillPending;
}

for (const name of pending) {
    missing.push(`${name} (not found after ${ATTEMPTS} attempts)`);
    console.error(`  ✗ ${name}@${expected} not on the registry`);
}

if (missing.length > 0) {
    console.error(`\n${names.length - missing.length}/${names.length} published. Missing:`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
}

console.log(`\nAll ${names.length} packages are live at ${expected}.`);
