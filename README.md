# @avatar-generator

[![CI](https://img.shields.io/github/actions/workflow/status/hugoogb/avatar-generator/ci.yml?style=flat-square&label=ci)](https://github.com/hugoogb/avatar-generator/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@avatar-generator/core?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/@avatar-generator/core)
[![npm downloads](https://img.shields.io/npm/dm/@avatar-generator/core?style=flat-square)](https://www.npmjs.com/package/@avatar-generator/core)
[![license](https://img.shields.io/npm/l/@avatar-generator/core?style=flat-square&color=blue)](./LICENSE)

Generate unique, deterministic SVG avatars with multiple styles.

## Features

- **11 Unique Styles**: Initials, Geometric, Pixels, Rings, Faces, Illustrated, Anime, Abstract, Emoji, Animals, and Gradient
- **Deterministic**: Same seed = same avatar, always
- **Tree-shakeable**: Only bundle the styles you use
- **Framework Support**: React, Vue, Svelte, Angular, a custom element, or plain JS
- **Tiny**: Core ships ESM and CommonJS builds with no runtime dependencies

## Quick Start

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

// Use the SVG
img.src = avatar.toDataUri();
```

## Available Styles

| Style       | Package                               | Description                                      |
| ----------- | ------------------------------------- | ------------------------------------------------ |
| Initials    | `@avatar-generator/style-initials`    | Letter initials on colored backgrounds           |
| Geometric   | `@avatar-generator/style-geometric`   | Grid-based shapes                                |
| Pixels      | `@avatar-generator/style-pixels`      | Retro pixel art                                  |
| Rings       | `@avatar-generator/style-rings`       | Concentric colored rings                         |
| Faces       | `@avatar-generator/style-faces`       | Minimal flat geometric faces                     |
| Illustrated | `@avatar-generator/style-illustrated` | Detailed cartoon faces with accessories          |
| Anime       | `@avatar-generator/style-anime`       | Anime/manga-inspired faces with expressive eyes  |
| Abstract    | `@avatar-generator/style-abstract`    | Mondrian/Kandinsky/Bauhaus-inspired compositions |
| Emoji       | `@avatar-generator/style-emoji`       | Yellow emoji-style expressive faces              |
| Animals     | `@avatar-generator/style-animals`     | Cute animal avatars (cat, dog, fox, panda, …)    |
| Gradient    | `@avatar-generator/style-gradient`    | Smooth color gradients with pattern overlays     |

## Framework Packages

- `@avatar-generator/react` — React component
- `@avatar-generator/angular` — Angular component
- `@avatar-generator/vue` — Vue 3 component
- `@avatar-generator/svelte` — Svelte 4+ component
- `@avatar-generator/web-component` — framework-agnostic custom element

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app/)

## Playground

Test the packages locally:

```bash
git clone https://github.com/hugoogb/avatar-generator.git
cd avatar-generator/playgrounds
pnpm install
```

| Package       | Command                         |
| ------------- | ------------------------------- |
| Core          | `pnpm playground:core`          |
| React         | `pnpm playground:react`         |
| Vue           | `pnpm playground:vue`           |
| Svelte        | `pnpm playground:svelte`        |
| Web Component | `pnpm playground:web-component` |

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb) — see [LICENSE](./LICENSE)
