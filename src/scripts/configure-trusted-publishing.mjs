/**
 * Configures npm trusted publishing for every package in the scope.
 *
 * npm has no organisation-level trusted publishing: the configuration lives on
 * each individual package. There is no setting that covers `@avatar-generator/*`
 * in one go. What npm does support is doing it in bulk from the CLI, which is
 * what this script is for — 17 packages in one run instead of 17 trips through
 * the website.
 *
 * Requires npm >= 11.5.1 (`npm trust` does not exist before that) and an
 * interactive `npm login` as a maintainer of the scope. Run it from a terminal,
 * never from CI: granting trust is the one step that must not itself be
 * automated by the thing being trusted.
 *
 *   npm login
 *   node scripts/configure-trusted-publishing.mjs --dry-run   # print the plan
 *   node scripts/configure-trusted-publishing.mjs             # apply it
 *   node scripts/configure-trusted-publishing.mjs --list      # show current state
 *
 * A trusted publisher can only be attached to a package that already exists on
 * npm, so publish once by hand before running this for a brand-new package.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REPOSITORY = "hugoogb/avatar-generator";
/** Workflow filename inside .github/workflows, which is what npm matches on. */
const WORKFLOW = "release.yml";

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

const DRY_RUN = process.argv.includes("--dry-run");
const LIST = process.argv.includes("--list");

const names = PACKAGE_DIRS.map((dir) => JSON.parse(readFileSync(join(SRC, dir, "package.json"), "utf8")).name);

/** npm's own docs recommend a pause between calls to avoid rate limiting. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const npm = (args) => execFileSync("npm", args, { encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] });

const version = npm(["--version"]).trim();
const [major, minor, patch] = version.split(".").map(Number);
const supported = major > 11 || (major === 11 && (minor > 5 || (minor === 5 && patch >= 1)));
if (!supported) {
    console.error(`npm ${version} has no \`npm trust\` command; trusted publishing needs >= 11.5.1.`);
    console.error("Install a newer npm with:  npm install -g npm@latest");
    process.exit(1);
}

if (LIST) {
    for (const name of names) {
        try {
            const out = npm(["trust", "list", name]).trim();
            console.log(`\n=== ${name} ===\n${out || "(no trusted publishers)"}`);
        } catch (err) {
            console.log(
                `\n=== ${name} ===\n  could not read: ${
                    String(err.stderr || err.message)
                        .trim()
                        .split("\n")[0]
                }`,
            );
        }
        await sleep(2000);
    }
    process.exit(0);
}

console.log(`Repository: ${REPOSITORY}`);
console.log(`Workflow:   .github/workflows/${WORKFLOW}`);
console.log(`Packages:   ${names.length}`);
console.log(DRY_RUN ? "\nDry run — nothing will be changed.\n" : "");

const failures = [];
let configured = 0;

for (const name of names) {
    const args = ["trust", "github", name, "--repository", REPOSITORY, "--file", WORKFLOW, "--allow-publish", "--yes"];

    if (DRY_RUN) {
        console.log(`  npm ${args.join(" ")}`);
        continue;
    }

    try {
        npm(args);
        configured++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        const detail =
            String(err.stderr || err.message)
                .trim()
                .split("\n")
                .find((l) => l.includes("npm error")) ?? "failed";
        failures.push({ name, detail });
        console.error(`  ✗ ${name} — ${detail}`);
    }

    // Rate limiting: npm's docs suggest ~2s between calls.
    await sleep(2000);
}

if (DRY_RUN) process.exit(0);

if (failures.length > 0) {
    console.error(`\n${configured} configured, ${failures.length} failed:`);
    for (const { name, detail } of failures) console.error(`  ${name}: ${detail}`);
    console.error("\nA package must already exist on npm before a trusted publisher can be attached to it.");
    process.exit(1);
}

console.log(`\nConfigured trusted publishing for ${configured} package(s).`);
console.log("Releases can now publish from CI with no NPM_TOKEN.");
