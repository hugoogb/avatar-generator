# @avatar-generator/style-anime

Anime avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Anime/manga-inspired faces with expressive eyes.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-anime
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { anime } from "@avatar-generator/style-anime";

const avatar = createAvatar(anime, {
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
