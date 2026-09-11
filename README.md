# @avatar-generator

[![CI](https://img.shields.io/github/actions/workflow/status/hugoogb/avatar-generator/ci.yml?style=flat-square&label=ci)](https://github.com/hugoogb/avatar-generator/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@avatar-generator/core?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/@avatar-generator/core)
[![npm downloads](https://img.shields.io/npm/dm/@avatar-generator/core?style=flat-square)](https://www.npmjs.com/package/@avatar-generator/core)
[![license](https://img.shields.io/npm/l/@avatar-generator/core?style=flat-square&color=blue)](./LICENSE)

Generate unique, deterministic SVG avatars in eleven styles, from any framework
or none.

> **Install the 3.x line.** v3.0.0 is the current release and the only supported
> one — 1.x and 2.x should not be used. See
> [Versions & Support](https://avatar-generator-two.vercel.app/reference/versioning/).

## Features

- **11 styles** — Initials, Geometric, Pixels, Rings, Faces, Illustrated, Anime, Abstract, Emoji, Animals, Gradient
- **Deterministic** — the same seed always produces byte-identical SVG
- **Tree-shakeable** — each style is its own package; you bundle only what you import
- **Works anywhere** — React, Vue, Svelte, Angular, a custom element, or plain JS
- **No runtime dependencies** — core ships ESM and CommonJS and depends on nothing
- **SSR-safe** — `createAvatar` returns a string; no DOM, no browser globals

## Quick start

```bash
npm install @avatar-generator/core @avatar-generator/style-initials
```

```typescript
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";

const avatar = createAvatar(initials, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri(); // …or inline avatar.svg
```

Core holds `createAvatar` and renders nothing on its own, so you always install
it together with at least one style.

## Requirements

- Node.js 18 or newer
- Packages ship ESM and CommonJS with a conditional `exports` map and
  per-condition type declarations
- `@avatar-generator/angular` is the exception: Angular Package Format is
  ESM-only, so it has no `require()` entry point

## Available styles

| Style       | Package                               | Description                                      |
| ----------- | ------------------------------------- | ------------------------------------------------ |
| Initials    | `@avatar-generator/style-initials`    | Letter initials on colored backgrounds           |
| Geometric   | `@avatar-generator/style-geometric`   | GitHub-style symmetrical identicon grids         |
| Pixels      | `@avatar-generator/style-pixels`      | 8-bit retro pixel faces                          |
| Rings       | `@avatar-generator/style-rings`       | Concentric rings, segmented and dashed variants  |
| Faces       | `@avatar-generator/style-faces`       | Minimal flat geometric faces                     |
| Illustrated | `@avatar-generator/style-illustrated` | Detailed cartoon faces with accessories          |
| Anime       | `@avatar-generator/style-anime`       | Anime/manga-inspired faces with expressive eyes  |
| Abstract    | `@avatar-generator/style-abstract`    | Mondrian/Kandinsky/Bauhaus-inspired compositions |
| Emoji       | `@avatar-generator/style-emoji`       | Yellow emoji-style expressive faces              |
| Animals     | `@avatar-generator/style-animals`     | Cute animal avatars (cat, dog, fox, panda, …)    |
| Gradient    | `@avatar-generator/style-gradient`    | Smooth gradients with pattern overlays           |

## Framework packages

| Package                           | For                                           | Guide                                                                          |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `@avatar-generator/react`         | React 18 and 19                               | [React](https://avatar-generator-two.vercel.app/guides/react/)                 |
| `@avatar-generator/vue`           | Vue 3                                         | [Vue](https://avatar-generator-two.vercel.app/guides/vue/)                     |
| `@avatar-generator/svelte`        | Svelte 4 and 5                                | [Svelte](https://avatar-generator-two.vercel.app/guides/svelte/)               |
| `@avatar-generator/angular`       | Angular 17 through 21, standalone or NgModule | [Angular](https://avatar-generator-two.vercel.app/guides/angular/)             |
| `@avatar-generator/web-component` | Any framework, or none                        | [Web Component](https://avatar-generator-two.vercel.app/guides/web-component/) |

All seventeen packages are released together at one version — mixing majors is
not supported.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app/)

- [Installation](https://avatar-generator-two.vercel.app/get-started/installation/)
- [Manual usage](https://avatar-generator-two.vercel.app/guides/manual/) — the core API
- [Cookbook](https://avatar-generator-two.vercel.app/guides/cookbook/) — groups, fallbacks, theming, caching, SSR
- [Creating custom styles](https://avatar-generator-two.vercel.app/guides/custom-styles/)
- [API reference](https://avatar-generator-two.vercel.app/reference/avatar/)
- [Style gallery](https://avatar-generator-two.vercel.app/reference/gallery/)
- [Migration guide](https://avatar-generator-two.vercel.app/reference/migration/) — upgrading from v1 or v2

## Playgrounds

Six Vite playgrounds run against the workspace sources:

```bash
git clone https://github.com/hugoogb/avatar-generator.git
cd avatar-generator/playgrounds
pnpm install
```

| Package       | Command                         |
| ------------- | ------------------------------- |
| Core          | `pnpm playground:core`          |
| React         | `pnpm playground:react`         |
| Angular       | `pnpm playground:angular`       |
| Vue           | `pnpm playground:vue`           |
| Svelte        | `pnpm playground:svelte`        |
| Web Component | `pnpm playground:web-component` |

`pnpm build:all` builds all six, which is what CI checks on every pull request.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, the quality checks, and how
releases are cut. Planned work lives in [ROADMAP.md](./ROADMAP.md).

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb) — see [LICENSE](./LICENSE)
