# create-avatar-style

Scaffold a custom avatar style package for [@avatar-generator](https://avatar-generator.hugoogb.dev/).

```bash
npm create avatar-style@latest my-style
npm create avatar-style@latest my-style -- --template face
```

| Template  | What you get                                                      |
| --------- | ----------------------------------------------------------------- |
| `minimal` | One layer. The smallest style that works                          |
| `pattern` | A seeded grid with its own option, for abstract styles            |
| `face`    | Head, hair, eyes and mouth layers, mixable with the bundled faces |

Each one is a complete package: `package.json`, TypeScript config, a build, a
test proving the style is deterministic, and a README.

```bash
cd my-style
npm install
npm test
npm run build
```

See the [custom styles guide](https://avatar-generator.hugoogb.dev/guides/custom-styles/).
