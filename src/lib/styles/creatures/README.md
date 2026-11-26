# @avatar-generator/style-creatures

Creatures avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Friendly made-up creature avatars.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-creatures
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { creatures } from "@avatar-generator/style-creatures";

const avatar = createAvatar(creatures, {
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
