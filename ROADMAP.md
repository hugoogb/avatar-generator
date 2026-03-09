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

- [ ] Replace generic Starlight README in `docs/README.md`
- [ ] Clean up legacy v1 test data in `playgrounds/consts.ts`

---

## v2.1.0 — Developer Experience Foundations

**Theme**: Make contributing easy, enforce code quality.

### Code Quality

- [ ] ESLint setup with shared config across all packages
- [ ] Prettier setup with shared config
- [ ] EditorConfig for consistent formatting across editors

### Git Hooks

- [ ] Husky for git hook management
- [ ] lint-staged for pre-commit linting and formatting

### Contributing

- [ ] CONTRIBUTING.md guide (setup, development workflow, PR process)
- [ ] pnpm scripts: `lint`, `format`, `check` at root level

---

## v2.2.0 — Testing & CI/CD

**Theme**: Confidence in every change.

### Testing

- [ ] Vitest setup with workspace support
- [ ] Unit tests for `@avatar-generator/core` (createRandom, buildSvg, utilities)
- [ ] Unit tests for each style package (deterministic output for given seed)
- [ ] SVG snapshot tests for output consistency
- [ ] Type tests for style option interfaces

### CI/CD

- [ ] GitHub Actions workflow: test on PR
- [ ] Build verification step for all packages
- [ ] Docs build verification
- [ ] Code coverage reporting

---

## v2.3.0 — Type Safety & Validation

**Theme**: Catch errors at compile time.

### Stricter Types

- [ ] Literal union types for style-specific string options (replace `string` with `"flat-top" | "cap" | ...`)
- [ ] Export type constants (`HAIR_STYLES`, `EYE_STYLES`, etc.) from each style for consumer use

### Runtime Validation

- [ ] Runtime validation for style option values with helpful error messages
- [ ] JSDoc improvements across all public APIs

---

## v2.4.0 — New Avatar Styles

**Theme**: More variety.

### New Styles

- [ ] `@avatar-generator/style-abstract` — Abstract geometric art (Mondrian/Kandinsky inspired)
- [ ] `@avatar-generator/style-emoji` — Emoji-style expressive faces
- [ ] `@avatar-generator/style-animals` — Cute animal avatars
- [ ] `@avatar-generator/style-gradient` — Beautiful gradient combinations with patterns

### Documentation

- [ ] Style gallery page in docs for visual comparison of all styles

---

## v2.5.0 — Framework Ecosystem

**Theme**: Use anywhere.

### New Framework Packages

- [ ] `@avatar-generator/vue` — Vue 3 component
- [ ] `@avatar-generator/svelte` — Svelte component
- [ ] `@avatar-generator/web-component` — Framework-agnostic custom element

### Playgrounds

- [ ] Angular playground
- [ ] Vue playground
- [ ] Svelte playground
- [ ] Storybook integration with all styles

---

## v2.6.0 — Enhanced Documentation & Playground

**Theme**: Best-in-class docs.

### Interactive Docs

- [ ] Per-style option controls (dropdowns for hairStyle, eyeStyle, etc.)
- [ ] Live code editor in docs (edit options, see result)
- [ ] Style comparison gallery page

### Guides

- [ ] "Creating Custom Styles" guide
- [ ] Cookbook with common patterns (avatar groups, fallbacks, theming)

### Distribution

- [ ] CDN/standalone script bundle for no-build usage

---

## v3.0.0 — Platform

**Theme**: Extensibility and advanced features.

### Custom Style Builder

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
