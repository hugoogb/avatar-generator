/**
 * Confirms every package actually landed on the registry at the expected
 * version with a provenance attestation, after publishing.
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
    ...["react", "angular", "vue", "svelte", "web-component", "create-avatar-style"].map((p) => `packages/${p}`),
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
 *
 * The 3.0.1 release took about five minutes to become fully visible, so this
 * waits for up to nine and a half.
 */
const ATTEMPTS = 20;
const BACKOFF_MS = 30_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const registryField = (name, field) => {
    try {
        return execFileSync("npm", ["view", `${name}@${expected}`, field, "--prefer-online"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        }).trim();
    } catch {
        return "";
    }
};

/**
 * Being on the registry does not show the release workflow put it there. The
 * publish step skips any version that already exists, so a version published by
 * hand passes it having published nothing, which is how 3.0.0 shipped without
 * provenance. An attestation exists only if the workflow really did publish.
 */
const problemWith = (name) => {
    if (registryField(name, "version") !== expected) return "not on the registry";
    if (!registryField(name, "dist.attestations.url")) return "no provenance attestation";
    return null;
};

let pending = [...names];
const problems = new Map();

for (let attempt = 1; attempt <= ATTEMPTS && pending.length > 0; attempt++) {
    if (attempt > 1) {
        console.log(`\n  ${pending.length} not verified yet; waiting ${BACKOFF_MS / 1000}s for the registry…\n`);
        await sleep(BACKOFF_MS);
    }

    const stillPending = [];
    for (const name of pending) {
        const problem = problemWith(name);
        if (problem) {
            problems.set(name, problem);
            stillPending.push(name);
        } else {
            problems.delete(name);
            console.log(`  ✓ ${name}@${expected}`);
        }
    }
    pending = stillPending;
}

if (problems.size > 0) {
    console.error(`\n${names.length - problems.size}/${names.length} verified after ${ATTEMPTS} attempts. Failed:`);
    for (const [name, problem] of problems) console.error(`  ✗ ${name}@${expected} — ${problem}`);
    process.exit(1);
}

console.log(`\nAll ${names.length} packages are live at ${expected} with provenance attestations.`);
