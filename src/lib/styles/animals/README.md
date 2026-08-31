# @avatar-generator/style-animals

Animals avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Cute animal avatars (cat, dog, fox, panda, …).

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-animals
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { animals } from "@avatar-generator/style-animals";

const avatar = createAvatar(animals, {
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
