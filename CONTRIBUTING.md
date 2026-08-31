# Contributing to Avatar Generator

Thank you for your interest in contributing! This guide will help you get set up and working with the project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)

## Project Structure

```
avatar-generator/
├── src/                    # Source packages (pnpm workspace root)
│   ├── lib/                # @avatar-generator/core + style packages
│   └── packages/           # Framework wrappers (React, Angular)
├── playgrounds/            # Development playgrounds (Vite)
│   ├── core/               # Core playground
│   └── react/              # React playground
├── docs/                   # Documentation site (Astro + Starlight)
├── eslint.config.js        # ESLint flat config
├── .prettierrc             # Prettier config
└── .editorconfig           # Editor formatting config
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/hugoogb/avatar-generator.git
cd avatar-generator

# Install root tooling dependencies
pnpm install

# Install source dependencies and build
cd src
pnpm install
pnpm build

# Run a playground
cd ../playgrounds
pnpm install
pnpm playground:core     # Core playground
pnpm playground:react    # React playground
pnpm playground:angular  # Angular playground (also: vue, svelte, web-component)

# Run the docs site
cd ../docs
pnpm install
pnpm dev
```

## Code Quality

The project uses ESLint and Prettier with a pre-commit hook that automatically lints and formats staged files.

```bash
# From the project root:
pnpm run lint          # Run ESLint
pnpm run lint:fix      # Auto-fix lint issues
pnpm run format        # Format all files with Prettier
pnpm run format:check  # Check formatting without writing
pnpm run check         # Run both lint and format check
```

These checks run automatically on staged files when you commit (via Husky + lint-staged).

## Packaging

Packages are built with [tsup](https://tsup.egoist.dev/), which emits ESM, CommonJS
and matching declaration files into `dist/`. `tsc` is only used for typechecking.

A green build does not prove a package is usable. Bundlers resolve extensionless
imports and largely ignore `type` and `exports`, so a package can work in every
playground here and still fail for anyone who installs it from npm. Three checks
guard against that, and all three run in CI:

```bash
cd src
pnpm run check:exports   # publint (manifest) + attw (type resolution)
pnpm run smoke           # pack, install and load every package from real Node
pnpm run verify:publish  # build + both of the above
```

`pnpm run smoke` packs all 17 packages, installs the tarballs into a throwaway
project and loads each one from Node as ESM and as CommonJS, generates an avatar
from every style, and compiles the published Svelte component with no
preprocessor configured.

If you change a package's `exports`, `main`, `types` or build script, run
`pnpm run verify:publish` before opening the PR.

## Releasing

Versions are managed with [changesets](https://github.com/changesets/changesets).
Every `@avatar-generator/*` package is in a **fixed** group and moves to the same
version together — hand-bumping them separately is what let the versions drift to
2.0.0 / 2.4.0 / 2.5.0.

When you make a user-visible change, describe it:

```bash
cd src
pnpm changeset
```

To cut a release:

```bash
cd src
pnpm run version-packages   # applies pending changesets, updates CHANGELOGs
pnpm run release:dry        # full verification + `pnpm publish --dry-run`
```

Commit the version bump, then tag and push:

```bash
git tag v3.0.0
git push origin v3.0.0
```

The tag triggers `.github/workflows/release.yml`, which re-runs typecheck, tests,
the build, `publint`, `attw` and the Node smoke test against the tagged tree,
verifies the tag matches every package version, and only then publishes to npm
with provenance and opens a GitHub release. Nothing publishes on a merge.

`workflow_dispatch` runs the same workflow with `dry_run` on by default, so you
can exercise it without releasing.

### One-time setup

Publishing needs an `NPM_TOKEN` repository secret — an npm **automation** token
for an account with publish rights on the `@avatar-generator` scope
(_Settings → Secrets and variables → Actions_). Provenance additionally requires
the workflow's `id-token: write` permission, which is already set.

## Making Changes

1. Create a feature branch from `develop`:

    ```bash
    git checkout -b feat/your-feature develop
    ```

2. Make your changes and commit using [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat:` — new feature
    - `fix:` — bug fix
    - `docs:` — documentation changes
    - `refactor:` — code refactoring
    - `test:` — adding or updating tests
    - `chore:` — maintenance tasks

3. Push your branch and open a Pull Request against `develop`.
