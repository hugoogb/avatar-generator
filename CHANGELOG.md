# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

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
