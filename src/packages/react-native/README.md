# @avatar-generator/react-native

React Native component for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/react-native @avatar-generator/style-initials react-native-svg
```

`react`, `react-native` (0.77 or later), `react-native-svg` and `@avatar-generator/core`
are peer dependencies. In Expo, install `react-native-svg` with `npx expo install react-native-svg`.

## Usage

```tsx
import { Avatar } from "@avatar-generator/react-native";
import { initials } from "@avatar-generator/style-initials";

<Avatar style={initials} options={{ seed: "john.doe@example.com", size: 64 }} alt="John Doe" />;
```

`theme: "auto"` follows the device's colour scheme and contrast setting.
Animation is not supported, because `react-native-svg` does not run CSS.

## Styles

Any of the fifteen style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`, `@avatar-generator/style-robots`, `@avatar-generator/style-portraits`, `@avatar-generator/style-creatures`, `@avatar-generator/style-marks`

See the [React Native guide](https://avatar-generator.hugoogb.dev/guides/react-native/) for the full prop list.

## Documentation

Full documentation: [avatar-generator.hugoogb.dev](https://avatar-generator.hugoogb.dev)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
