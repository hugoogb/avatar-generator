# @avatar-generator/vue

Vue 3 component for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/vue @avatar-generator/style-initials
```

`vue` and `@avatar-generator/core` are peer dependencies.

## Usage

```svelte
<script setup lang="ts">
import { Avatar } from "@avatar-generator/vue";
import { initials } from "@avatar-generator/style-initials";
</script>

<template>
    <Avatar :style="initials" :options="{ seed: 'john.doe@example.com', size: 64 }" alt="John Doe" />
</template>
```

## Styles

Any of the eleven style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`

See the [Vue 3 guide](https://avatar-generator-two.vercel.app/guides/vue/) for the full prop list.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
