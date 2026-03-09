# Avatar Generator Roadmap

## v2.0.1 — Sync & Polish

Fix synchronization issues between source, playgrounds, and documentation.

### Sync Fixes
- [ ] Add Anime style to React playground (`playgrounds/react/main.tsx`)
- [ ] Add Anime style to docs interactive Playground (`docs/src/components/Playground.astro`)
- [ ] Fix FacesOptions documentation to match actual style values (`docs/src/content/docs/reference/avatar.mdx`)
- [ ] Fix Faces test data in playground consts (`playgrounds/consts.ts`)
- [ ] Fix syntax issue in consts.ts (missing closing quote)

### Polish
- [ ] Replace generic Starlight README in `docs/README.md`
- [ ] Remove or document legacy v1 test data in `playgrounds/consts.ts`

---

## v2.1.0 — Quality

Add testing infrastructure and improve type safety.

### Testing
- [ ] Set up test framework (Vitest)
- [ ] Add unit tests for `@avatar-generator/core` (createRandom, buildSvg, utilities)
- [ ] Add unit tests for each style package (deterministic output for given seed)
- [ ] Add snapshot tests for SVG output consistency
- [ ] Add type tests for style option interfaces

### Type Safety
- [ ] Add stricter literal union types for style-specific string options (e.g., `hairStyle`, `eyeStyle`) instead of plain `string`
- [ ] Add runtime validation for style option values with helpful error messages
- [ ] Export type constants (e.g., `HAIR_STYLES`, `EYE_STYLES`) from each style package for consumer use

### CI/CD
- [ ] Add GitHub Actions workflow for running tests on PRs
- [ ] Add build verification step for all packages
- [ ] Add docs build verification

---

## v2.2.0 — Developer Experience

Expand framework support and improve documentation.

### New Packages
- [ ] `@avatar-generator/angular` — Angular component wrapper
- [ ] `@avatar-generator/vue` — Vue component wrapper
- [ ] `@avatar-generator/svelte` — Svelte component wrapper

### Playgrounds
- [ ] Add Angular playground
- [ ] Add Vue playground
- [ ] Improve docs playground with per-style option controls (dropdowns for hairStyle, eyeStyle, etc.)

### Documentation
- [ ] Add interactive examples for each style option
- [ ] Add migration guide from v1 to v2
- [ ] Add "Creating Custom Styles" guide
- [ ] Add style comparison gallery page

---

## v3.0.0 — Future

Major feature additions and architectural improvements.

### Custom Style Builder
- [ ] Design public API for creating custom avatar styles
- [ ] Style builder with composable feature functions (head, eyes, mouth, hair)
- [ ] Style template system for quick custom style creation
- [ ] CLI tool for scaffolding new style packages

### Animation Support
- [ ] Animated SVG transitions between seeds
- [ ] Idle animation support (blinking, breathing)
- [ ] CSS animation class integration

### Style Combining
- [ ] Mix features from multiple styles (e.g., Illustrated hair + Faces eyes)
- [ ] Style interpolation between two styles
- [ ] Feature override API across styles

### Advanced Features
- [ ] Accessibility improvements (ARIA labels, high-contrast mode)
- [ ] SSR-optimized rendering path
- [ ] Avatar group component (overlapping circles)
- [ ] Lazy loading and placeholder support
- [ ] Theme system (light/dark mode color palettes)
