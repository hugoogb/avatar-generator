# @avatar-generator/style-abstract

Abstract avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Mondrian/Kandinsky/Bauhaus-inspired compositions.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-abstract
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { abstract } from "@avatar-generator/style-abstract";

const avatar = createAvatar(abstract, {
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
