---
title: Introduction
description: Generate unique, deterministic SVG avatars with multiple styles.
---

**@avatar-generator** is a library for generating unique, deterministic SVG avatars. Give it a seed (like a user ID or email), pick a style, and get a consistent avatar every time.

## Features

- **4 Unique Styles**: Initials, Geometric, Pixels, and Rings
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
| **Geometric** | Grid-based shapes (circles, squares, triangles) |
| **Pixels** | Symmetric pixel art patterns |
| **Rings** | Concentric colored rings |

## Getting Started

1. [Install](/get-started/installation) the core package and a style
2. Check out the [Playground](/get-started/playground) to try all styles
3. Read the [Manual Usage](/guides/manual) guide for the core API
4. See [React](/guides/react) or [Angular](/guides/angular) guides for framework usage

## v2.0 Changes

Version 2.0 introduces a new style-based architecture. If you're upgrading from v1, see the [Migration Guide](/reference/migration).
