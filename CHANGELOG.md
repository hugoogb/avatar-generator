# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [3.0.0] — Distribution, Release Pipeline & CI Repair

### Breaking

#### Style option types moved out of core

`@avatar-generator/core` declared `FacesOptions`, `AnimeOptions`,
`AnimalsOptions` and every other style's option type — 29 in all. Core therefore
knew about all eleven styles: adding one meant editing and releasing core, and a
style published by anyone else could not be typed. Each style now owns its
option type.

```diff
- import type { FacesOptions } from "@avatar-generator/core";
+ import type { FacesOptions } from "@avatar-generator/style-faces";
```

Core now declares only `AvatarOptions`, `Style`, `Random`, `AvatarResult` and
the deprecated `LegacyAvatarOptions`. The types themselves are unchanged and the
style packages already re-exported them, so code importing from the style
package needs no change. A test in core asserts the boundary holds.

#### Angular is now a real Angular library

`@avatar-generator/angular` shipped plain `tsc` output, which is not Angular
Package Format. The component was never partially compiled, so a consumer's AOT
build fell back to the JIT compiler and failed with "needs to be compiled using
the JIT compiler, but '@angular/compiler' is not available". It is now built
with ng-packagr and ships a FESM2022 bundle with partial-Ivy declarations.

`AvatarComponent` is also `standalone: true`. Components have been standalone by
default since Angular 19 and declaring one in an NgModule is an error, so the
old shape could not compile on current Angular at all.

```diff
  @Component({
+   imports: [AvatarComponent],
    template: `<avatar-generator [style]="style" [options]="options" />`,
  })
```

`AvatarModule` still works and now re-exports the standalone component, so
existing `imports: [AvatarModule]` code needs no change. Supported Angular
versions widen to `^17 || ^18 || ^19 || ^20 || ^21`. Angular Package Format is
ESM-only, so this package has no `require()` entry point.

These are the only breaking changes, and they are why this release is 3.0.0
rather than the 2.6.1 originally prepared.

### Fixed

- `@avatar-generator/web-component` broke server-side rendering. The class
  extended `HTMLElement` at module scope, so importing the package from a
  Next.js, Nuxt, Astro or SvelteKit server render threw
  `ReferenceError: HTMLElement is not defined` before any consumer code ran. The
  element now extends a stand-in when there is no DOM, and `register()` returns
  early without a registry. The smoke test imports and executes this package
  under real Node so it cannot regress quietly

### Testing

- The five framework wrappers had no tests at all; they are now covered for
  rendering, prop reactivity, sizing, alt handling and determinism
  (100/100/100/96/90%). 274 tests, up from 221
- Fixed `register(tagName)` in `@avatar-generator/web-component`, which could
  never succeed: importing the package auto-registers `AvatarElement` as
  `<avatar-generator>`, and the custom element registry allows one tag name per
  constructor, so any consumer calling `register('my-avatar')` hit
  `NotSupportedError`. Additional names now get their own subclass

### Everything below shipped in the same release

Nothing in this release changes what an avatar looks like — the SVG snapshots
are byte-identical. It makes the packages installable and the pipeline real.

#### Fixed

- **Published packages could not be loaded by Node.** Every `lib/*` package
  shipped ESM output with no `"type": "module"`, so `require()` failed on the
  `export` keyword, and `tsc` emitted extensionless relative specifiers
  (`from "./random"`), so `import` failed with `ERR_MODULE_NOT_FOUND`. Only a
  bundler doing node10-style resolution could load them, which is why the
  playgrounds never caught it. Builds now go through tsup and emit ESM + CJS
  with correct extensions, a conditional `exports` map, and per-condition
  type declarations
- **CI had never passed a single run.** All four jobs died at
  `actions/setup-node` because `cache: pnpm` requires a lockfile and
  `pnpm-lock.yaml` was in `.gitignore` — tests, typecheck and build
  verification had never executed on GitHub. Lockfiles are now committed for
  all four projects and every install uses `--frozen-lockfile`
- `src/lib/core/src/types.ts` was not Prettier-clean, which would have failed
  the lint job independently
- Tarballs shipped `src/`, `tsconfig.json` and `tsconfig.tsbuildinfo`; every
  package now declares `files` and publishes only `dist/` plus its LICENSE
- `@avatar-generator/svelte` shipped a `<script lang="ts">` component, so it
  could not compile for any consumer without a preprocessor configured. The
  published component is now preprocessed to plain JavaScript
- The Svelte playground could not build: `@sveltejs/vite-plugin-svelte@4`
  requires Svelte 5 while the playground pins Svelte 4
- `develop` was missing the MIT LICENSE file that only existed on `master`

#### Added

- `pnpm run smoke` — packs all 17 packages, installs the tarballs into a clean
  project, and loads each from real Node as both ESM and CommonJS, generates an
  avatar from every style, and compiles the published Svelte component with no
  preprocessor
- `pnpm run check:exports` — `publint --strict` and `attw` across every package
- `pnpm run verify:publish` — build plus both of the above
- CI jobs for packaging verification and for building all five playgrounds
- `engines.node: ">=18"`, `repository`, `homepage` and `bugs` on every package

#### Changed

- Packages build with tsup instead of `tsc`; `tsc` now only typechecks
- Per-package tsconfigs extend a shared `src/tsconfig.base.json` and use
  `moduleResolution: "Bundler"`

#### Release pipeline

- Versions are managed with [changesets](https://github.com/changesets/changesets);
  all `@avatar-generator/*` packages are a fixed group and move together
- All 17 packages aligned onto one version line — they had drifted to
  2.0.0 / 2.4.0 / 2.5.0 and were hand-bumped
- Cross-package ranges use `workspace:^`, resolved at publish time, replacing a
  hand-written `publishConfig.dependencies` pin of `^2.0.0` that never moved
- `.github/workflows/release.yml` — publishes on a `v*` tag after re-running
  typecheck, tests, build, publint, attw and the Node smoke test against the
  tagged tree, with npm provenance and a generated GitHub release. Nothing
  publishes on a merge
- `scripts/check-release-version.mjs` refuses to publish when the tag and the
  package versions disagree
- Every package now ships a README and CHANGELOG, so npm package pages are not
  blank

#### Note for consumers on 2.0.0

`@avatar-generator/core@2.0.0`, `style-initials@2.0.0` and `react@2.0.0` are the
only versions ever published, and none of them could be loaded by Node. 2.6.1 is
the first release that can be, and the first to carry the eleven styles and five
framework wrappers the documentation describes.

The added `exports` map means deep paths such as
`@avatar-generator/core/dist/svg` no longer resolve. They were never documented,
and the packages that exposed them could not be imported at all, so nothing can
have depended on them in practice.

### v2.6.0 — Enhanced Documentation

#### Added

- "Creating Custom Styles" guide — Style\<T\> contract, core helpers
  (createRandom, buildSvg, escapeXml, validateOption), a checker-style
  walkthrough, literal-union option pattern, determinism checklist,
  and packaging-for-npm notes
- "Cookbook" guide — avatar groups, Gravatar-style fallbacks, per-theme
  palettes, in-memory caching, server-side rendering notes
- Interactive `/reference/configurator/` page with a per-style
  Configurator component: pick a style, adjust every option via form
  controls, see the generated avatar update live, copy the exact
  `createAvatar()` call

#### Deferred to follow-up

- Live in-page code editor — needs CodeMirror + sandboxed eval
- CDN/standalone script bundle — tracked separately

### v2.5.0 — Framework Ecosystem

#### Added

- `@avatar-generator/vue` — Vue 3 `<Avatar>` component using
  `defineComponent` + `h()`, with `computed` caching so unchanged props
  don't re-run `createAvatar`
- `@avatar-generator/svelte` — Svelte 4+ `<Avatar>` shipped as a raw
  `.svelte` file, resolved via the `svelte` export condition
- `@avatar-generator/web-component` — framework-agnostic
  `<avatar-generator>` custom element. Importing the package
  auto-registers it; a `register(tagName)` helper supports custom tag
  names
- New playgrounds: `pnpm playground:vue`, `pnpm playground:svelte`,
  `pnpm playground:web-component`
- Docs: new guide pages for Vue, Svelte, and Web Component usage
  under `/guides/`

#### Deferred to follow-up

- Angular playground — needs zone.js + bootstrapApplication / Analog
  plugin configuration; tracked separately
- Storybook integration — tracked separately

### v2.4.0 — New Avatar Styles

#### Added

- `@avatar-generator/style-abstract` — three compositions (Mondrian,
  Kandinsky, Bauhaus); exports `COMPOSITIONS` and
  `AbstractComposition`/`AbstractOptions` types
- `@avatar-generator/style-emoji` — ten expressions (happy, laughing, cool,
  wink, love, sad, angry, surprised, sleepy, neutral); exports
  `EXPRESSIONS` and `EmojiExpression`/`EmojiOptions` types
- `@avatar-generator/style-animals` — eight animals (cat, dog, bear, fox,
  panda, bunny, frog, monkey); exports `ANIMALS` and
  `Animal`/`AnimalsOptions` types
- `@avatar-generator/style-gradient` — linear/radial/diagonal gradients with
  optional dots/stripes/waves/grid overlays; exports `DIRECTIONS`,
  `PATTERNS`, and `GradientDirection`/`GradientPattern`/`GradientOptions`
- Core exports the new option types and literal unions
- Docs: new `/reference/gallery/` page rendering all 11 styles side by side
  from a shared seed set
- Docs: interactive Playground now includes abstract, emoji, animals, and
  gradient preview cards
- Docs: API Reference tables for the four new option interfaces
- Playgrounds (core and React) render the new styles with fixture options

### v2.3.0 — Type Safety & Validation

#### Added

- Literal union types for all string-based style overrides: `FacesHairStyle`,
  `FacesEyeStyle`, `FacesMouthStyle`, `IllustratedHairStyle`,
  `IllustratedEyeStyle`, `IllustratedEyebrowStyle`, `IllustratedNoseStyle`,
  `IllustratedMouthStyle`, `AnimeHairStyle`, `AnimeEyeStyle`,
  `AnimeMouthStyle`, `AnimeNoseStyle`, `RingsCenterStyle`
- Named value-array exports from each style package (`HAIR_STYLES`,
  `EYE_STYLES`, `MOUTH_STYLES`, etc.) for building UI pickers
- `validateOption` helper in core that throws a descriptive error when a
  user-provided override is not in the accepted value list
- Runtime validation wired into `faces`, `illustrated`, `anime`, and `rings`
- Expanded JSDoc on `createAvatar`, `createRandom`, `buildSvg`, `Random`,
  `AvatarResult`, and `Style`

#### Changed

- `FacesOptions`, `IllustratedOptions`, `AnimeOptions`, and `RingsOptions`
  now type their override fields with literal unions instead of `string`

### v2.2.0 — Testing & CI/CD

#### Added

- Vitest with workspace support, coverage via `@vitest/coverage-v8`
- Unit tests for `@avatar-generator/core` (`createRandom`, `buildSvg`,
  `createAvatar`, SVG utilities)
- Parameterized deterministic-output tests covering all seven styles
- SVG file snapshots under `src/lib/styles/test/__snapshots__/`
- Type tests using `expectTypeOf` and a dedicated `tsconfig.test.json`
- `tsc --noEmit` typecheck script for test files
- GitHub Actions workflow (`.github/workflows/ci.yml`) running lint,
  typecheck, tests with coverage upload, package build, and docs build

#### Fixed

- `buildSvg` generated the clip-path id with `Math.random()`, producing
  different SVG bytes for the same seed; ids are now derived from the seed
  hash so output is fully deterministic

#### Changed

- Stopped tracking `tsconfig.tsbuildinfo` files (build artifacts)

### v2.1.0 — Developer Experience Foundations

#### Added

- ESLint flat config with typescript-eslint for all TypeScript files
- Prettier config matching existing code style
- EditorConfig for consistent formatting across editors
- Husky + lint-staged pre-commit hook (auto-lint and format staged files)
- Root `package.json` with `lint`, `format`, and `check` scripts
- `CONTRIBUTING.md` with setup, workflow, and code quality guide

### v2.0.1 — Polish

#### Changed

- Replaced generic Starlight template `docs/README.md` with project-specific content

#### Removed

- Legacy v1 test data (`LEGACY_OPTIONS`) from `playgrounds/consts.ts`

## [2.0.0] - 2026-02-19

### Added

- 7 avatar styles: Initials, Geometric, Pixels, Rings, Faces, Illustrated, Anime
- `@avatar-generator/core` — deterministic SVG generation engine with seed-based randomness
- `@avatar-generator/react` — React component wrapper
- `@avatar-generator/angular` — Angular component wrapper
- Core + React development playgrounds with Vite
- Astro/Starlight documentation site with interactive playground
- API reference with all style options documented
- v1 to v2 migration guide
- Backward-compatible `createAvatarElement()` legacy API

### Changed

- Complete architecture rewrite from v1
- Modular style system with `Style<T>` interface
- Tree-shakeable package structure

## [1.0.0] - 2024-12-27

### Added

- Initial release with basic avatar generation
- Simple initials-based avatars
- React and Angular component wrappers

---

### Maintenance Note

Update this file with every PR/release. Use semantic sections (Added/Changed/Fixed/Removed).
Move [Unreleased] items to a new version section when releasing.
