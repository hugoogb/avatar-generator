# @avatar-generator/web-component

Framework-agnostic custom element for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

## From a CDN, no build

```html
<script src="https://cdn.jsdelivr.net/npm/@avatar-generator/web-component@3"></script>
<avatar-generator avatar-style="faces" seed="ana" size="48"></avatar-generator>
```

The script bundles core and all fifteen styles, and exposes the API as `window.AvatarGenerator`.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/web-component @avatar-generator/style-initials
```

`@avatar-generator/core` is a peer dependency.

## Usage

```ts
import "@avatar-generator/web-component";
import { initials } from "@avatar-generator/style-initials";

const el = document.querySelector("avatar-generator");
el.styleImpl = initials;
el.options = { seed: "john.doe@example.com", size: 64 };
```

Or register a style and use attributes:

```ts
import { registerStyle } from "@avatar-generator/web-component";
import { initials } from "@avatar-generator/style-initials";

registerStyle(initials); // <avatar-generator avatar-style="initials" seed="Ana">
```

## Styles

Any of the fifteen style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`, `@avatar-generator/style-robots`, `@avatar-generator/style-portraits`, `@avatar-generator/style-creatures`, `@avatar-generator/style-marks`

See the [Web Component guide](https://avatar-generator.hugoogb.dev/guides/web-component/) for the full prop list.

## Documentation

Full documentation: [avatar-generator.hugoogb.dev](https://avatar-generator.hugoogb.dev)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
