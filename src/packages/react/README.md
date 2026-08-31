# @avatar-generator/react

React component for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/react @avatar-generator/style-initials
```

`react` and `@avatar-generator/core` are peer dependencies.

## Usage

```tsx
import { Avatar } from "@avatar-generator/react";
import { initials } from "@avatar-generator/style-initials";

<Avatar style={initials} options={{ seed: "john.doe@example.com", size: 64 }} alt="John Doe" />;
```

## Styles

Any of the eleven style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`

See the [React guide](https://avatar-generator-two.vercel.app/guides/react/) for the full prop list.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
