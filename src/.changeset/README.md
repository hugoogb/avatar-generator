# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): small
files describing what changed and how the version should move. Adding one is
part of making a change, not part of releasing it.

```bash
cd src
pnpm changeset          # describe your change
```

Every `@avatar-generator/*` package is in a **fixed** version group, so they all
move to the same version together. That is deliberate: the styles and the
framework wrappers are only meaningful against a matching `core`, and hand-bumping
them separately is what let the versions drift to 2.0.0 / 2.4.0 / 2.5.0 in the
first place. You only need one changeset per change, naming any affected package.

Releasing is described in `CONTRIBUTING.md`.
