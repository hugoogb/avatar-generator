# @avatar-generator/style-robots

Robots avatar style for [`@avatar-generator/core`](https://www.npmjs.com/package/@avatar-generator/core).
Friendly robot avatars for bots, AI agents, service accounts and API keys: a metal head on
shoulders with glowing eyes, in a body colour kept apart from the background.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/style-robots
```

## Usage

```ts
import { createAvatar } from "@avatar-generator/core";
import { robots } from "@avatar-generator/style-robots";

const avatar = createAvatar(robots, {
    seed: "john.doe@example.com",
    size: 64,
});

img.src = avatar.toDataUri();
```

## Options

| Option        | Values                                                 |
| ------------- | ------------------------------------------------------ |
| `headShape`   | `box`, `rounded`, `dome`, `capsule`                    |
| `antenna`     | `none`, `ball`, `double`, `dish`, `bolt`               |
| `eyeStyle`    | `round`, `visor`, `cyclops`, `pixel`, `screen`         |
| `mouthStyle`  | `grille`, `slot`, `smile`, `none`                      |
| `metalColors` | Body palette; the pick stays apart from the background |

Options left unset are chosen deterministically from the seed. See the
[API reference](https://avatar-generator.hugoogb.dev/reference/avatar/) for every option this style accepts,
or the [configurator](https://avatar-generator.hugoogb.dev/reference/configurator/) to try them interactively.

## Documentation

Full documentation: [avatar-generator.hugoogb.dev](https://avatar-generator.hugoogb.dev)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
