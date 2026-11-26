# @avatar-generator/style-creatures

Creatures avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Friendly made-up monsters for games, kids' products and communities: a bright body with horns or
antennae, one to three eyes and a goofy grin. No real species, and the body always stands apart
from the background.

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

## Options

| Option       | Values                                      |
| ------------ | ------------------------------------------- |
| `bodyShape`  | `"round"`, `"tall"`, `"pear"`, `"wobbly"`   |
| `horns`      | `"none"`, `"nubs"`, `"curly"`, `"antennae"` |
| `eyes`       | `1`, `2`, `3`                               |
| `mouthStyle` | `"smile"`, `"tooth"`, `"open"`, `"tongue"`  |
| `markings`   | `"none"`, `"spots"`, `"belly"`              |
| `bodyColors` | a palette of body colours                   |

Options left unset are chosen deterministically from the seed. See the
[API reference](https://avatar-generator.hugoogb.dev/reference/avatar/) for every option this style accepts,
or the [configurator](https://avatar-generator.hugoogb.dev/reference/configurator/) to try them interactively.

## Documentation

Full documentation: [avatar-generator.hugoogb.dev](https://avatar-generator.hugoogb.dev)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
