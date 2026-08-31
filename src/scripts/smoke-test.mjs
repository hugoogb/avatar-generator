/**
 * Packs every workspace package, installs the tarballs into a throwaway
 * project, and loads them from real Node — as ESM and as CommonJS.
 *
 * This exists because `pnpm build` passing tells you nothing about whether the
 * published artifact is loadable. Bundlers (Vite, webpack) resolve
 * extensionless relative imports and largely ignore `type`/`exports`, so a
 * package can work in every playground and still throw ERR_MODULE_NOT_FOUND
 * for anyone who installs it from npm. Only Node's own resolver proves
 * otherwise.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

/** Peer dependencies the framework wrappers need present just to be loadable. */
const PEERS = { react: "^19", vue: "^3", svelte: "^4", "@angular/core": "^19" };

/**
 * The Svelte entry resolves to a raw `.svelte` component under the `svelte`
 * export condition; Node has nothing to load for it, by design.
 */
const NOT_NODE_LOADABLE = new Set(["@avatar-generator/svelte"]);

/**
 * Packages whose module body touches browser globals (`HTMLElement`,
 * `customElements`) and therefore cannot execute under Node. For these we
 * prove the entry *resolves* through the exports map — which is what this
 * script exists to catch — and leave executing them to a DOM environment.
 */
const BROWSER_ONLY = new Set(["@avatar-generator/web-component"]);

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** The line of a Node stack trace that actually says what went wrong. */
const errorLine = (err) => {
    const lines = String(err.stderr || err.message)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    return lines.find((l) => /^[A-Za-z]*(Error|Exception):/.test(l)) ?? lines[0] ?? "unknown failure";
};

const workdir = mkdtempSync(join(tmpdir(), "avatar-smoke-"));
let failures = 0;
const fail = (msg) => {
    failures++;
    console.error(`  ✗ ${msg}`);
};

try {
    // ---- 1. Pack every package -------------------------------------------
    // `pnpm pack` (not `npm pack`) so `workspace:*` ranges and the
    // `publishConfig.dependencies` overrides are resolved the way a real
    // `pnpm publish` would resolve them.
    const packDir = join(workdir, "tarballs");
    mkdirSync(packDir);

    // Keep name -> tarball paired; `pnpm pack` prints the path it wrote.
    const packed = new Map();
    for (const dir of PACKAGE_DIRS) {
        const abs = join(SRC, dir);
        const name = JSON.parse(readFileSync(join(abs, "package.json"), "utf8")).name;
        const out = run("pnpm", ["pack", "--pack-destination", packDir], abs).trim().split("\n").filter(Boolean);
        const tarball = out[out.length - 1];
        if (!tarball.endsWith(".tgz")) throw new Error(`could not determine tarball for ${name}: ${out.join(" ")}`);
        packed.set(name, tarball);
    }
    const names = [...packed.keys()];
    const tarballs = [...packed.values()];
    console.log(`Packed ${tarballs.length} package(s)`);

    // ---- 2. The tarball must contain only what we meant to publish -------
    for (const tarball of tarballs) {
        const leaked = run("tar", ["tzf", tarball])
            .split("\n")
            .filter(Boolean)
            .map((e) => e.replace(/^package\//, ""))
            .filter(
                (e) => !e.startsWith("dist/") && !["package.json", "LICENSE", "README.md", "CHANGELOG.md"].includes(e),
            );
        if (leaked.length) fail(`${tarball.split("/").pop()} ships non-dist files: ${leaked.join(", ")}`);
    }
    if (failures === 0)
        console.log("  ✓ every tarball contains only dist/, package.json, LICENSE, README and CHANGELOG");

    // ---- 3. Install them into a clean project ----------------------------
    const app = join(workdir, "app");
    mkdirSync(app);
    writeFileSync(
        join(app, "package.json"),
        JSON.stringify(
            {
                name: "smoke-test",
                private: true,
                version: "1.0.0",
                type: "module",
                dependencies: {
                    ...Object.fromEntries([...packed].map(([name, tarball]) => [name, `file:${tarball}`])),
                    ...PEERS,
                },
            },
            null,
            2,
        ),
    );

    console.log("\nInstalling tarballs into a clean project…");
    run("npm", ["install", "--no-audit", "--no-fund"], app);

    // A cross-package import must never be satisfied by an already-published
    // version from the registry — that would test npm's copy, not this build.
    for (const [name] of packed) {
        const installed = JSON.parse(readFileSync(join(app, "node_modules", name, "package.json"), "utf8")).version;
        const expected = JSON.parse(
            readFileSync(join(SRC, PACKAGE_DIRS[names.indexOf(name)], "package.json"), "utf8"),
        ).version;
        if (installed !== expected) fail(`${name} resolved to ${installed}, expected the local ${expected}`);
    }

    // ---- 4. Load each package from real Node, both module systems ---------
    const loadable = names.filter((n) => !NOT_NODE_LOADABLE.has(n));

    console.log("\nESM import:");
    for (const name of loadable) {
        const browserOnly = BROWSER_ONLY.has(name);
        const probe = browserOnly
            ? `import.meta.resolve(${JSON.stringify(name)});\n`
            : `await import(${JSON.stringify(name)});\n`;
        writeFileSync(join(app, "probe.mjs"), probe);
        try {
            run("node", ["probe.mjs"], app);
            console.log(`  ✓ import "${name}"${browserOnly ? " (resolved; browser-only)" : ""}`);
        } catch (err) {
            fail(`import "${name}" — ${errorLine(err)}`);
        }
    }

    console.log("\nCJS require:");
    for (const name of loadable) {
        const browserOnly = BROWSER_ONLY.has(name);
        const probe = browserOnly
            ? `require.resolve(${JSON.stringify(name)});\n`
            : `require(${JSON.stringify(name)});\n`;
        writeFileSync(join(app, "probe.cjs"), probe);
        try {
            run("node", ["probe.cjs"], app);
            console.log(`  ✓ require("${name}")${browserOnly ? " (resolved; browser-only)" : ""}`);
        } catch (err) {
            fail(`require("${name}") — ${errorLine(err)}`);
        }
    }

    // ---- 5. Actually generate an avatar from the installed packages -------
    console.log("\nEnd-to-end avatar generation:");
    const styles = names.filter((n) => n.startsWith("@avatar-generator/style-"));
    writeFileSync(
        join(app, "generate.mjs"),
        `
import { createAvatar } from "@avatar-generator/core";

for (const name of ${JSON.stringify(styles)}) {
    const mod = await import(name);
    const style = Object.values(mod).find((v) => v && typeof v.create === "function");
    if (!style) throw new Error(name + " exports no Style implementation");

    const a = createAvatar(style, { seed: "smoke-test" });
    const b = createAvatar(style, { seed: "smoke-test" });
    if (!a.svg.startsWith("<svg")) throw new Error(name + " did not produce an SVG");
    if (a.svg !== b.svg) throw new Error(name + " is not deterministic");
    if (!a.toDataUri().startsWith("data:image/svg+xml")) throw new Error(name + " toDataUri is malformed");

    console.log("  \\u2713 " + name + " — " + a.svg.length + " bytes, deterministic");
}
`,
    );
    try {
        process.stdout.write(run("node", ["generate.mjs"], app));
    } catch (err) {
        fail(`avatar generation — ${errorLine(err)}`);
    }

    // ---- 6. The Svelte component must compile with no preprocessor -------
    // A library cannot require consumers to configure svelte-preprocess, so the
    // published .svelte file has to be plain JS, not `<script lang="ts">`.
    console.log("\nSvelte component:");
    writeFileSync(
        join(app, "compile-svelte.mjs"),
        `
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const component = require.resolve("@avatar-generator/svelte/Avatar.svelte");
const { js } = compile(readFileSync(component, "utf8"), { generate: "dom" });
if (!js.code.includes("createAvatar")) throw new Error("compiled component lost its core import");
console.log("  \\u2713 @avatar-generator/svelte/Avatar.svelte compiles without a preprocessor");
`,
    );
    try {
        process.stdout.write(run("node", ["compile-svelte.mjs"], app));
    } catch (err) {
        fail(`svelte component — ${errorLine(err)}`);
    }
} finally {
    rmSync(workdir, { recursive: true, force: true });
}

if (failures > 0) {
    console.error(`\n${failures} smoke-test failure(s)`);
    process.exit(1);
}
console.log("\nAll packages install, resolve and run from real Node.");
