# @avatar-generator/style-emoji

Emoji avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Yellow emoji-style expressive faces.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-emoji
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { emoji } from "@avatar-generator/style-emoji";

const avatar = createAvatar(emoji, {
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
