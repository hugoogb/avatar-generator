# @avatar-generator/style-illustrated

Illustrated avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Detailed cartoon faces with accessories.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-illustrated
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { illustrated } from "@avatar-generator/style-illustrated";

const avatar = createAvatar(illustrated, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri();
```

Options left unset are chosen deterministically from the seed. See the
[API reference](https://avatar-generator-two.vercel.app/reference/avatar/) for every option this style accepts,
or the [configurator](https://avatar-generator-two.vercel.app/reference/configurator/) to try them interactively.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
