# Avatar Generator Roadmap

## v2.0.1 — Bug Fixes & Sync

Fix synchronization issues between source, playgrounds, and documentation.

### Sync Fixes

- [x] Add Anime style to React playground (`playgrounds/react/main.tsx`)
- [x] Add Anime style to docs interactive Playground (`docs/src/components/Playground.astro`)
- [x] Fix FacesOptions documentation to match actual style values (`docs/src/content/docs/reference/avatar.mdx`)
- [x] Fix Faces test data in playground consts (`playgrounds/consts.ts`)
- [x] Fix syntax issue in consts.ts (missing closing quote)

### Polish

- [x] Replace generic Starlight README in `docs/README.md`
- [x] Clean up legacy v1 test data in `playgrounds/consts.ts`

---

## v2.1.0 — Developer Experience Foundations

**Theme**: Make contributing easy, enforce code quality.

### Code Quality

- [x] ESLint setup with shared config across all packages
- [x] Prettier setup with shared config
- [x] EditorConfig for consistent formatting across editors

### Git Hooks

- [x] Husky for git hook management
- [x] lint-staged for pre-commit linting and formatting

### Contributing

- [x] CONTRIBUTING.md guide (setup, development workflow, PR process)
- [x] pnpm scripts: `lint`, `format`, `check` at root level

---

## v2.2.0 — Testing & CI/CD

**Theme**: Confidence in every change.

### Testing

- [x] Vitest setup with workspace support
- [x] Unit tests for `@avatar-generator/core` (createRandom, buildSvg, utilities)
- [x] Unit tests for each style package (deterministic output for given seed)
- [x] SVG snapshot tests for output consistency
- [x] Type tests for style option interfaces

### CI/CD

- [x] GitHub Actions workflow: test on PR
- [x] Build verification step for all packages
- [x] Docs build verification
- [x] Code coverage reporting

---

## v2.3.0 — Type Safety & Validation

**Theme**: Catch errors at compile time.

### Stricter Types

- [x] Literal union types for style-specific string options (replace `string` with `"flat-top" | "cap" | ...`)
- [x] Export type constants (`HAIR_STYLES`, `EYE_STYLES`, etc.) from each style for consumer use

### Runtime Validation

- [x] Runtime validation for style option values with helpful error messages
- [x] JSDoc improvements across all public APIs

---

## v2.4.0 — New Avatar Styles

**Theme**: More variety.

### New Styles

- [x] `@avatar-generator/style-abstract` — Abstract geometric art (Mondrian/Kandinsky inspired)
- [x] `@avatar-generator/style-emoji` — Emoji-style expressive faces
- [x] `@avatar-generator/style-animals` — Cute animal avatars
- [x] `@avatar-generator/style-gradient` — Beautiful gradient combinations with patterns

### Documentation

- [x] Style gallery page in docs for visual comparison of all styles

---

## v2.5.0 — Framework Ecosystem

**Theme**: Use anywhere.

### New Framework Packages

- [x] `@avatar-generator/vue` — Vue 3 component
- [x] `@avatar-generator/svelte` — Svelte component
- [x] `@avatar-generator/web-component` — Framework-agnostic custom element

### Playgrounds

- [x] Angular playground _(shipped in 3.0.0)_
- [x] Vue playground
- [x] Svelte playground
- [ ] Storybook integration with all styles _(deferred — separate conversation)_

---

## v2.6.0 — Enhanced Documentation & Playground

**Theme**: Best-in-class docs.

### Interactive Docs

- [x] Per-style option controls (dropdowns for hairStyle, eyeStyle, etc.) — `/reference/configurator/`
- [ ] Live code editor in docs (edit options, see result) _(deferred — needs CodeMirror + sandboxed eval)_
- [x] Style comparison gallery page — `/reference/gallery/` (shipped in v2.4.0)

### Guides

- [x] "Creating Custom Styles" guide
- [x] Cookbook with common patterns (avatar groups, fallbacks, theming)

### Distribution

- [ ] CDN/standalone script bundle for no-build usage _(deferred — separate conversation)_

---

## v3.0.0 — Distribution, Release Pipeline & CI Repair

**Theme**: Make the published artifact real.

### Packaging

- [x] Build with tsup: ESM + CJS + declarations, correct file extensions
- [x] `"type": "module"`, conditional `exports` map, `files` on all 17 packages
- [x] Publish only `dist/` and LICENSE (tarballs were shipping `src/` and tsconfig)
- [x] Preprocess the Svelte component so consumers need no preprocessor
- [x] `engines.node`, `repository`, `homepage`, `bugs` metadata

### Verification

- [x] `publint --strict` and `attw` across every package
- [x] Smoke test: pack, install and load every package from real Node (ESM + CJS)
- [x] CI job for packaging verification
- [x] CI job building all five playgrounds

### CI

- [x] Commit lockfiles and install with `--frozen-lockfile` (CI had never passed)
- [x] Fix the Prettier failure in `core/types.ts`
- [x] MIT LICENSE on `develop`

### Testing & architecture

- [x] Tests for all five framework wrappers (were 0%; now 100/100/100/96/90%)
- [x] Fix `register(tagName)` in the web component, which could never succeed
- [x] Move style option types out of core into the style that implements them
- [x] Boundary test so a style-specific type cannot drift back into core
- [x] Reconcile `master` and `develop`

### Release pipeline

- [x] Changesets with a fixed version group across all 17 packages
- [x] All packages aligned onto one version line (were 2.0.0 / 2.4.0 / 2.5.0)
- [x] `workspace:^` cross-package ranges, resolved at publish time
- [x] Release workflow: tag-triggered, full verification, npm provenance
- [x] Tag/version guard so a mismatched tag cannot publish
- [x] Per-package README and CHANGELOG so npm pages are not blank

### Framework packages

- [x] `@avatar-generator/web-component` is SSR-safe — it no longer throws
      `ReferenceError: HTMLElement is not defined` when imported on a server
- [x] `@avatar-generator/angular` is built with ng-packagr as an Angular Package
      Format library (FESM2022, partial Ivy), so AOT builds can consume it
- [x] `AvatarComponent` is standalone; `AvatarModule` re-exports it for
      NgModule applications
- [x] Angular support widened to `^17 || ^18 || ^19 || ^20 || ^21`
- [x] Smoke test asserts the Angular tarball really is partial-Ivy APF

### Follow-ups

- [ ] Add the `NPM_TOKEN` secret and push the `v3.0.0` tag to publish
- [x] Angular playground — every framework wrapper now has one, and all six
      are verified to render in a real browser, not just to build

---

## v3.1.0 — Platform

**Theme**: Extensibility and advanced features.

### Custom Style Builder

- [x] Style packages own their option types, so a third-party style is typeable
      without core knowing it exists (prerequisite, shipped above)
- [ ] Public API for creating custom avatar styles with composable feature functions
- [ ] Style template system for scaffolding new styles
- [ ] CLI tool (`create-avatar-style`) for generating style packages

### Animation Support

- [ ] Idle animations (blinking, breathing)
- [ ] Animated SVG transitions between seeds
- [ ] CSS animation class integration

### Style Combining

- [ ] Mix features across styles (e.g., Illustrated hair + Faces eyes)
- [ ] Feature override API across styles

### Advanced Features

- [ ] Accessibility (ARIA labels, high-contrast mode, `prefers-reduced-motion`)
- [ ] SSR-optimized rendering path
- [ ] Avatar group component (overlapping circles)
- [ ] Theme system (light/dark mode color palettes)
