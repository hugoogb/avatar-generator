---
title: Introduction
description: Generate unique, deterministic SVG avatars with multiple styles.
---

**@avatar-generator** is a library for generating unique, deterministic SVG avatars. Give it a seed (like a user ID or email), pick a style, and get a consistent avatar every time.

## Features

- **7 Unique Styles**: Initials, Identicon, Pixel Faces, Rings, Faces, Illustrated, and Anime
- **Deterministic**: Same seed = same avatar, always
- **Tree-shakeable**: Only bundle the styles you use
- **Framework Support**: React, Angular, or vanilla JS
- **Customizable**: Colors, size, shape, borders, and more
- **Tiny**: Core is under 2KB minified

## Quick Example

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

| Style | Description |
|-------|-------------|
| **Initials** | Letter initials on colored backgrounds |
| **Identicon** | GitHub-style symmetrical 5x5 grid patterns |
| **Pixel Faces** | 8-bit retro faces with eyes, mouth, and hair |
| **Rings** | Concentric rings with segmented and dashed variants |
| **Faces** | Minimal flat geometric faces |
| **Illustrated** | Detailed cartoon faces with accessories |
| **Anime** | Anime/manga-inspired faces with expressive eyes and spiky hair |

## Getting Started

1. [Install](/get-started/installation) the core package and a style
2. Check out the [Playground](/get-started/playground) to try all styles
3. Read the [Manual Usage](/guides/manual) guide for the core API
4. See [React](/guides/react) or [Angular](/guides/angular) guides for framework usage

## v2.0 Changes

Version 2.0 introduces a new style-based architecture. If you're upgrading from v1, see the [Migration Guide](/reference/migration).
