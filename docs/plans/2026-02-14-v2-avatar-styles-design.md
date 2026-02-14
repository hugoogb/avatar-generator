# Avatar Generator v2.0 - SVG Styles Design

**Date:** 2026-02-14
**Status:** Draft

## Overview

Redesign avatar-generator from an initials-only library to a multi-style SVG avatar generator with best-in-class developer experience. This is a breaking change (v2.0).

## Goals

1. **Unique visual styles** - 4 distinct SVG-based avatar styles
2. **Developer experience** - Simple API, tree-shakeable, excellent TypeScript
3. **Framework support** - Core + React + Angular wrappers
4. **Great documentation** - Interactive playground with live previews

## Architecture: Style-First

Each style is a standalone package implementing a common interface. The core is a tiny orchestrator.

```
@avatar-generator/core              # ~2KB orchestrator
@avatar-generator/react             # React wrapper
@avatar-generator/angular           # Angular wrapper
@avatar-generator/style-initials    # Migrated from v1
@avatar-generator/style-geometric   # New: geometric shapes
@avatar-generator/style-pixels      # New: pixel art
@avatar-generator/style-rings       # New: concentric rings
```

## Core API

```typescript
// Types
export interface Style {
  name: string;
  generate: (seed: string, options: StyleOptions, random: Random) => string;
}

export interface AvatarOptions {
  style: Style;
  size?: number;              // Default: 80
  colors?: string[];          // Custom color palette
  square?: boolean;           // Default: false (circle)
  transparent?: boolean;      // Default: false
  border?: {
    width?: number;           // Default: 2
    color?: string;           // Default: currentColor
  };
  rotate?: number;            // Degrees (0-360)
  flip?: 'horizontal' | 'vertical' | 'both';
  scale?: number;             // Default: 1.0
}

// Functions
export function createAvatar(seed: string, options: AvatarOptions): string;
export function createRandom(seed: string): Random;
```

## Usage Examples

### Core (Vanilla JS/TS)
```typescript
import { createAvatar } from '@avatar-generator/core';
import { geometric } from '@avatar-generator/style-geometric';

const svg = createAvatar('john.doe@example.com', {
  style: geometric,
  size: 64,
  border: { width: 2, color: '#3b82f6' },
});

// Insert SVG into DOM element
const container = document.getElementById('avatar');
container.replaceChildren();
container.insertAdjacentHTML('beforeend', svg);
```

### React
```tsx
import { Avatar } from '@avatar-generator/react';
import { geometric } from '@avatar-generator/style-geometric';

<Avatar
  seed="john@example.com"
  style={geometric}
  size={64}
  transparent
  border={{ width: 2, color: '#3b82f6' }}
/>
```

### Angular
```typescript
import { AvatarComponent } from '@avatar-generator/angular';
import { geometric } from '@avatar-generator/style-geometric';

@Component({
  template: `<avatar [seed]="email" [style]="geometric" [size]="64" />`
})
export class MyComponent {
  geometric = geometric;
}
```

## Avatar Styles

### 1. style-initials
Migrated from v1. Renders initials with colored/gradient backgrounds.
- Extracts up to 2 initials from seed
- Gradient backgrounds, customizable fonts

### 2. style-geometric
Deterministic geometric shapes in a grid pattern.
- Circles, triangles, squares, hexagons
- 4x4 grid composition
- Color palette derived from seed

### 3. style-pixels
Pixel art style avatars.
- 8x8 pixel grid
- Horizontally symmetric patterns
- Retro gaming aesthetic

### 4. style-rings
Concentric rings with varying colors/widths.
- 3-5 rings per avatar
- Variable stroke widths
- Clean, minimal aesthetic

## Documentation Updates

1. **Interactive Playground** - Live avatar generator with all styles/options
2. **Style Gallery** - Visual showcase of all styles
3. **API Reference** - Full options documentation
4. **Migration Guide** - v1 to v2 upgrade path
5. **Creating Custom Styles** - Guide for community contributions

## Success Criteria

- [ ] All 4 styles generate deterministic SVG avatars
- [ ] Core bundle < 3KB minified
- [ ] React and Angular wrappers working
- [ ] Interactive playground deployed
- [ ] Documentation updated for v2
