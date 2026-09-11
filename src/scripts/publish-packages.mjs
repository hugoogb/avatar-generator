/**
 * Publishes every package to npm using trusted publishing (OIDC).
 *
 * Two tools, each doing the part it is good at:
 *
 *   pnpm pack     resolves `workspace:^` into a real version range and honours
 *                 `publishConfig.directory` (the Angular package publishes the
 *                 ng-packagr output, not its source directory). npm understands
 *                 neither.
 *   npm publish   performs the OIDC token exchange with the registry. pnpm does
 *                 not — there is no OIDC code in the pnpm 10 bundle at all — so
 *                 `pnpm publish` would fall back to looking for a token that,
 *                 with trusted publishing, deliberately does not exist.
 *
 * Requires npm >= 11.5.1 and Node >= 22.14, per npm's trusted publishing
 * requirements. Provenance is generated automatically; passing `--provenance`
 * is unnecessary.
 *
 *   node scripts/publish-packages.mjs [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

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

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const workdir = mkdtempSync(join(tmpdir(), "avatar-publish-"));
const published = [];
const failures = [];

try {
    // ---- 1. Pack everything first -----------------------------------------
    // Packing all 17 before publishing any means a packing mistake cannot
    // leave half the scope released — npm publishes are permanent.
    const packDir = join(workdir, "tarballs");
    const packed = [];

    for (const dir of PACKAGE_DIRS) {
        const abs = join(SRC, dir);
        const { name, version } = JSON.parse(readFileSync(join(abs, "package.json"), "utf8"));
        const out = run("pnpm", ["pack", "--pack-destination", packDir], abs).trim().split("\n").filter(Boolean);
        const tarball = out[out.length - 1];
        if (!tarball.endsWith(".tgz")) throw new Error(`could not determine tarball for ${name}: ${out.join(" ")}`);
        packed.push({ name, version, tarball });
    }

    const versions = new Set(packed.map((p) => p.version));
    if (versions.size !== 1) {
        throw new Error(`packages disagree on version: ${[...versions].join(", ")}`);
    }
    const version = [...versions][0];
    console.log(`Packed ${packed.length} package(s) at ${version}\n`);

    // ---- 2. Publish each tarball ------------------------------------------
    // npm's OIDC helper is explicitly written never to throw: if the token
    // exchange fails — most often because the package has no trusted publisher
    // registered — it logs the reason and returns, and npm then falls back to
    // ordinary credentials that deliberately do not exist. The publish fails as
    // a plain auth error with no hint of the real cause, so run verbose and
    // keep the output to print if something goes wrong.
    for (const { name, tarball } of packed) {
        const args = ["publish", tarball, "--access", "public", "--loglevel", "verbose"];
        if (DRY_RUN) args.push("--dry-run");

        try {
            run("npm", args, workdir);
            published.push(name);
            console.log(`  ${DRY_RUN ? "would publish" : "published"} ${name}@${version}`);
        } catch (err) {
            const lines = String(err.stderr || err.message)
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);

            // The `oidc` lines are the ones that say why trusted publishing
            // did not take, which the error itself never mentions.
            const oidc = lines.filter((l) => /\boidc\b/i.test(l)).slice(0, 3);
            const errors = lines.filter((l) => l.startsWith("npm error")).slice(0, 3);
            const detail = [...oidc, ...errors].join(" | ") || "unknown failure";

            failures.push({ name, detail });
            console.error(`  FAILED ${name}@${version} — ${detail}`);
        }
    }
} finally {
    rmSync(workdir, { recursive: true, force: true });
}

if (failures.length > 0) {
    console.error(`\n${published.length} published, ${failures.length} failed:`);
    for (const { name, detail } of failures) console.error(`  ${name}: ${detail}`);
    console.error(
        "\nIf this is the first release for a package, note that a trusted publisher" +
            "\ncan only be attached to a package that already exists on npm. See the" +
            "\nReleasing section of CONTRIBUTING.md.",
    );
    process.exit(1);
}

console.log(`\n${DRY_RUN ? "Dry run complete" : "Published"}: ${published.length} package(s).`);
