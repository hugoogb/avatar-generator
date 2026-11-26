# @avatar-generator/web-component

## 3.3.0

### Patch Changes

- @avatar-generator/core@3.3.0

## 3.2.0

### Minor Changes

- 6a010a2: Add a no-build browser bundle. `<script src="https://cdn.jsdelivr.net/npm/@avatar-generator/web-component@3">` defines both elements, registers every built-in style and exposes the API as `window.AvatarGenerator`. The elements gain `avatar-style`, `seed`, `size` and `options` attributes (and `items` for groups), so plain HTML renders with no JavaScript, and `registerStyle` names a style for the `avatar-style` attribute from a bundler build.

### Patch Changes

- @avatar-generator/core@3.2.0

## 3.1.0

### Minor Changes

- All eleven styles are redrawn for production use, so every seed looks different from 3.0.x. Details now scale with the avatar, the default palette keeps text at 4.5:1 or better, and a skin tone no longer follows the background colour. If you store or compare avatar bytes, regenerate them or pin an exact version.

### Patch Changes

- Updated dependencies
    - @avatar-generator/core@3.1.0

## 3.0.2

### Patch Changes

- Updated dependencies
    - @avatar-generator/core@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [503836b]
- Updated dependencies [49847f8]
    - @avatar-generator/core@3.0.1

## 3.0.0

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies [c6e7e63]
    - @avatar-generator/core@3.0.0
