# @avatar-generator/style-portraits

Portraits avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Single-colour portrait avatars for professional tools.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-portraits
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { portraits } from "@avatar-generator/style-portraits";

const avatar = createAvatar(portraits, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri();
```

Options left unset are chosen deterministically from the seed. See the
[API reference](https://avatar-generator.hugoogb.dev/reference/avatar/) for every option this style accepts,
or the [configurator](https://avatar-generator.hugoogb.dev/reference/configurator/) to try them interactively.

## Documentation

Full documentation: [avatar-generator.hugoogb.dev](https://avatar-generator.hugoogb.dev)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
