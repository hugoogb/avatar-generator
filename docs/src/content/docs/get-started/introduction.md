---
title: Introduction
description: Generate unique, deterministic SVG avatars with eleven styles, in any framework.
---

**@avatar-generator** generates unique, deterministic SVG avatars. Give it a
seed — a user ID, an email, anything stringy — pick a style, and get the same
avatar back every time, on every platform.

:::caution[Install the 3.x line]
v3.0.0 is the current release and the only supported one. The 2.x tarballs on
npm cannot be loaded by Node, and most of the 2.x line was never published at
all. See [Versions & Support](/reference/versioning/).
:::

## Features

- **11 styles** — from letter initials to anime faces, each its own package
- **Deterministic** — the same seed always produces byte-identical SVG
- **Tree-shakeable** — you only bundle the styles you actually import
- **Works anywhere** — React, Vue, Svelte, Angular, a custom element, or plain JS
- **No runtime dependencies** — core ships ESM and CommonJS and depends on nothing
- **SSR-safe** — `createAvatar` returns a string; no DOM, no browser globals

## Quick example

```typescript
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";

const avatar = createAvatar(initials, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri(); // or use avatar.svg directly
```

## Available styles

Every style is a separate package, so eleven styles cost you nothing if you
import one.

| Style           | Package                               | Description                                      |
| --------------- | ------------------------------------- | ------------------------------------------------ |
| **Initials**    | `@avatar-generator/style-initials`    | Letter initials on colored backgrounds           |
| **Geometric**   | `@avatar-generator/style-geometric`   | GitHub-style symmetrical identicon grids         |
| **Pixels**      | `@avatar-generator/style-pixels`      | 8-bit retro pixel faces                          |
| **Rings**       | `@avatar-generator/style-rings`       | Concentric rings, segmented and dashed variants  |
| **Faces**       | `@avatar-generator/style-faces`       | Minimal flat geometric faces                     |
| **Illustrated** | `@avatar-generator/style-illustrated` | Detailed cartoon faces with accessories          |
| **Anime**       | `@avatar-generator/style-anime`       | Anime/manga-inspired faces with expressive eyes  |
| **Abstract**    | `@avatar-generator/style-abstract`    | Mondrian/Kandinsky/Bauhaus-inspired compositions |
| **Emoji**       | `@avatar-generator/style-emoji`       | Yellow emoji-style expressive faces              |
| **Animals**     | `@avatar-generator/style-animals`     | Cute animal avatars (cat, dog, fox, panda, …)    |
| **Gradient**    | `@avatar-generator/style-gradient`    | Smooth gradients with pattern overlays           |

See them side by side in the [Style Gallery](/reference/gallery/), or tweak
their options in the [Configurator](/reference/configurator/).

## Framework packages

| Package                           | For                                           |
| --------------------------------- | --------------------------------------------- |
| `@avatar-generator/react`         | React 18 and 19                               |
| `@avatar-generator/vue`           | Vue 3                                         |
| `@avatar-generator/svelte`        | Svelte 4 and 5                                |
| `@avatar-generator/angular`       | Angular 17 through 21, standalone or NgModule |
| `@avatar-generator/web-component` | Any framework, or none — a custom element     |

None of these are required: `createAvatar` returns an SVG string you can render
however you like.

## How determinism works

A style never calls `Math.random()`. It derives every choice — palette entry,
hair style, expression — from a seeded generator built from `options.seed`. The
same seed and options therefore produce the same bytes in a Node server render,
a browser, and an edge runtime. That is what makes an avatar usable as a stable
identity: you can generate it on demand instead of storing it.

## Getting started

1. [Install](/get-started/installation/) core and at least one style
2. Try every style in the [Playground](/get-started/playground/)
3. Read [Manual Usage](/guides/manual/) for the core API
4. Or jump to your framework: [React](/guides/react/), [Vue](/guides/vue/),
   [Svelte](/guides/svelte/), [Angular](/guides/angular/),
   [Web Component](/guides/web-component/)
5. Browse the [Cookbook](/guides/cookbook/) for avatar groups, image fallbacks,
   theming, caching and SSR

## Upgrading

Coming from an older version? The [Migration Guide](/reference/migration/)
covers both v2 → v3 (two import changes) and v1 → v3 (a full API change).
