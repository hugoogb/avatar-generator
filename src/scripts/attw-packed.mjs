/**
 * Runs `attw` against the tarball `pnpm pack` actually produces, rather than
 * against the package directory.
 *
 * `attw --pack .` shells out to npm, which does not understand pnpm's
 * `workspace:` ranges or `publishConfig.directory`. For a package whose
 * published root is a build output (the Angular one, built by ng-packagr into
 * `dist/`), that means attw inspects the wrong directory and every entry point
 * fails to resolve. Packing with pnpm first gives it the real artifact.
 *
 * Any arguments are forwarded to attw, e.g.:
 *
 *     node ../../scripts/attw-packed.mjs --ignore-rules cjs-resolves-to-esm
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workdir = mkdtempSync(join(tmpdir(), "attw-pack-"));

try {
    execFileSync("pnpm", ["pack", "--pack-destination", workdir], { stdio: ["ignore", "pipe", "inherit"] });

    const tarball = readdirSync(workdir).find((f) => f.endsWith(".tgz"));
    if (!tarball) throw new Error("pnpm pack produced no tarball");

    execFileSync("attw", [join(workdir, tarball), ...process.argv.slice(2)], { stdio: "inherit" });
} finally {
    rmSync(workdir, { recursive: true, force: true });
}
