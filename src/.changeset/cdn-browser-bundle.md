---
"@avatar-generator/web-component": minor
---

Add a no-build browser bundle. `<script src="https://cdn.jsdelivr.net/npm/@avatar-generator/web-component@3">` defines both elements, registers all eleven styles and exposes the API as `window.AvatarGenerator`. The elements gain `avatar-style`, `seed`, `size` and `options` attributes (and `items` for groups), so plain HTML renders with no JavaScript, and `registerStyle` names a style for the `avatar-style` attribute from a bundler build.
