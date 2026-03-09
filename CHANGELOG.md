# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

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
