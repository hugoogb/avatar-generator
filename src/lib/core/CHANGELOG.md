# @avatar-generator/core

## 3.0.0

### Major Changes

- **Breaking:** `@avatar-generator/angular` is now a real Angular library, built
  with ng-packagr, and its component is standalone.

    The package previously shipped plain `tsc` output. That is not Angular Package
    Format: the component was never partially compiled, so a consumer's AOT build
    would fall back to the JIT compiler and fail with "needs to be compiled using
    the JIT compiler, but '@angular/compiler' is not available". It now ships a
    FESM2022 bundle with partial-Ivy declarations, the layout Angular has required
    of libraries since v13.

    `AvatarComponent` is now `standalone: true`. Components have been standalone by
    default since Angular 19, and declaring a standalone component in an NgModule is
    an error, so the old `declarations: [AvatarComponent]` shape could not compile on
    current Angular at all.

    **Migration** — import the component directly:

    ```diff
      @Component({
    -   template: `<avatar-generator [style]="style" [options]="options" />`,
    +   imports: [AvatarComponent],
    +   template: `<avatar-generator [style]="style" [options]="options" />`,
      })
    ```

    `AvatarModule` still works for NgModule-based applications and now imports and
    re-exports the standalone component, so existing `imports: [AvatarModule]` code
    needs no change.

    Supported Angular versions widen to `^17 || ^18 || ^19 || ^20 || ^21`; the
    partial declarations carry a `minVersion` of 12/14, so newer majors link them
    without trouble.

    Note that Angular Package Format is ESM-only — Angular dropped CommonJS and UMD
    output in v13 — so this package has no `require()` entry point.

- **Breaking:** style option types now live in the style package that implements
  them, not in `@avatar-generator/core`.

    `@avatar-generator/core` used to declare `FacesOptions`, `AnimeOptions`,
    `AnimalsOptions`, `GradientOptions` and every other style's option type — 29
    types in all. That meant core knew about all eleven styles, adding a style meant
    editing and releasing core, and a style published by anyone else could not be
    typed at all. Core now declares only the Style contract: `AvatarOptions`,
    `Style`, `Random`, `AvatarResult` and the deprecated `LegacyAvatarOptions`.

    **Migration** — import the option type from the style you are using:

    ```diff
    - import type { FacesOptions } from "@avatar-generator/core";
    + import type { FacesOptions } from "@avatar-generator/style-faces";
    ```

    The types are unchanged; only where they come from has moved. Style packages
    already re-exported them, so code that imported from the style package needs no
    change. Runtime behaviour is identical and the SVG snapshots are byte-identical.

    A test in core asserts the boundary holds, so a style-specific type cannot drift
    back in.

### Patch Changes

- Make the published packages loadable from Node.

    Every package shipped ESM output with no `"type": "module"`, so `require()`
    failed on the `export` keyword, and `tsc` emitted extensionless relative
    specifiers, so `import` failed with `ERR_MODULE_NOT_FOUND`. Only a bundler doing
    node10-style resolution could load them. Packages are now built with tsup and
    ship ESM + CJS with correct extensions, a conditional `exports` map, and
    per-condition type declarations.

    Also in this release:

    - Tarballs no longer ship `src/`, `tsconfig.json` or `tsconfig.tsbuildinfo`
    - `@avatar-generator/svelte` ships a preprocessed, plain-JavaScript component;
      it previously shipped `<script lang="ts">` and could not compile for any
      consumer without a preprocessor configured
    - Cross-package ranges resolve at publish time instead of a hand-written
      `^2.0.0` that never moved
    - `engines.node`, `repository`, `homepage` and `bugs` metadata on every package
    - All packages share one version line; they had drifted to 2.0.0 / 2.4.0 / 2.5.0

    This is the first release to carry the styles and framework wrappers added in
    2.1.0 through 2.6.0 — npm previously only had 2.0.0 of `core`, `style-initials`
    and `react`.

    No avatar output changes; the SVG snapshots are byte-identical.

- `@avatar-generator/web-component` no longer breaks server-side rendering.

    `class AvatarElement extends HTMLElement` was evaluated the moment the module
    was imported, and `HTMLElement` does not exist on a server. Importing the
    package from a Next.js, Nuxt, Astro or SvelteKit server render therefore threw
    `ReferenceError: HTMLElement is not defined` before any of the consumer's code
    ran — which is exactly what an SSR framework does with every import in a
    component file.

    The element now extends a stand-in when there is no DOM, and `register()`
    returns early when there is no custom element registry, so importing the package
    on a server is a no-op. Browser behaviour is unchanged.

    The packaging smoke test now imports and executes this package under real Node
    rather than only resolving it, so the regression cannot come back quietly.

- c6e7e63: Fix `register(tagName)` in `@avatar-generator/web-component`, which could never
  succeed. Importing the package auto-registers `AvatarElement` as
  `<avatar-generator>`, and the custom element registry allows one tag name per
  constructor — so any consumer calling `register('my-avatar')` hit
  `NotSupportedError`. Additional tag names now get their own subclass.

    Found by the first tests these wrappers have ever had: `@avatar-generator/react`,
    `vue`, `svelte`, `angular` and `web-component` were at 0% coverage and are now
    covered for rendering, prop reactivity, sizing, alt handling and determinism.
