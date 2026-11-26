# @avatar-generator/style-marks

Marks avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Logo-like badge avatars for workspaces, teams and organisations.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-marks
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { marks } from "@avatar-generator/style-marks";

const avatar = createAvatar(marks, {
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
