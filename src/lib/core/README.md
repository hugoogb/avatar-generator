# @avatar-generator/core

Core engine for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator):
deterministic SVG avatar generation. The same seed always produces byte-identical
output.

This package holds `createAvatar`, the seeded random generator and the SVG
helpers. It renders nothing on its own — pair it with a style package.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-initials
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";

const avatar = createAvatar(initials, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri();
```

## Styles

`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`

## Framework wrappers

`@avatar-generator/react`, `@avatar-generator/vue`, `@avatar-generator/svelte`, `@avatar-generator/angular`, `@avatar-generator/web-component`

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
