# create-avatar-style

## 3.1.0

### Minor Changes

- All eleven styles are redrawn for production use, so every seed looks different from 3.0.x. Details now scale with the avatar, the default palette keeps text at 4.5:1 or better, and a skin tone no longer follows the background colour. If you store or compare avatar bytes, regenerate them or pin an exact version.

- Platform release: `defineStyle` and the `create-avatar-style` scaffolder, `mixStyles`, idle animation and seed transitions, light, dark, high-contrast and automatic themes, accessible names, `renderToString`, and avatar groups in every framework. Everything is opt-in: output with no new options set is byte-identical to 3.0.2, apart from `toDataUri()` now encoding non-ASCII text correctly.
