# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### v2.6.1 — Distribution & CI Repair

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
