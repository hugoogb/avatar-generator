# @avatar-generator/core

## 2.6.1

### Patch Changes

- Make the published packages loadable from Node.

    Every package shipped ESM output with no `"type": "module"`, so `require()`
    failed on the `export` keyword, and `tsc` emitted extensionless relative
    specifiers, so `import` failed with `ERR_MODULE_NOT_FOUND`. Only a bundler doing
    node10-style resolution could load them. Packages are now built with tsup and
    ship ESM + CJS with correct extensions, a conditional `exports` map, and
    per-condition type declarations.

    Also in this release:

    - Tarballs no longer ship `src/`, `tsconfig.json` or `tsconfig.tsbuildinfo`
    - `@avatar-generator/svelte` ships a preprocessed, plain-JavaScript component;
      it previously shipped `<script lang="ts">` and could not compile for any
      consumer without a preprocessor configured
    - Cross-package ranges resolve at publish time instead of a hand-written
      `^2.0.0` that never moved
    - `engines.node`, `repository`, `homepage` and `bugs` metadata on every package
    - All packages share one version line; they had drifted to 2.0.0 / 2.4.0 / 2.5.0

    This is the first release to carry the styles and framework wrappers added in
    2.1.0 through 2.6.0 — npm previously only had 2.0.0 of `core`, `style-initials`
    and `react`.

    No avatar output changes; the SVG snapshots are byte-identical.
