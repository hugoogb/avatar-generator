# @avatar-generator/web-component

Web Component component for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

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

## Styles

Any of the eleven style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`

See the [Web Component guide](https://avatar-generator-two.vercel.app/guides/web-component/) for the full prop list.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
