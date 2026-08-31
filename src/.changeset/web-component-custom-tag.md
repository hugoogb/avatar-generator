---
"@avatar-generator/core": patch
---

Fix `register(tagName)` in `@avatar-generator/web-component`, which could never
succeed. Importing the package auto-registers `AvatarElement` as
`<avatar-generator>`, and the custom element registry allows one tag name per
constructor — so any consumer calling `register('my-avatar')` hit
`NotSupportedError`. Additional tag names now get their own subclass.

Found by the first tests these wrappers have ever had: `@avatar-generator/react`,
`vue`, `svelte`, `angular` and `web-component` were at 0% coverage and are now
covered for rendering, prop reactivity, sizing, alt handling and determinism.
