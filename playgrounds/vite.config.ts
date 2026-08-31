import angular from "@analogjs/vite-plugin-angular";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

function pluginsFor(playground: string): PluginOption[] {
    switch (playground) {
        case "react":
            return [react()];
        case "vue":
            return [vue()];
        case "svelte":
            return [svelte({ preprocess: vitePreprocess() })];
        // Angular components need the Angular compiler, not just esbuild:
        // esbuild strips the decorators without producing an Ivy definition,
        // and the component fails to instantiate at runtime.
        case "angular":
            return [angular()];
        default:
            return [];
    }
}

export default defineConfig(({ mode }) => {
    const playground = mode || "core";

    return {
        root: resolve(__dirname, playground),
        plugins: pluginsFor(playground),
        resolve: {
            // The playground and src/packages/angular are separate pnpm
            // projects, so each has its own physical @angular/* install. Two
            // copies of @angular/core in one bundle means the component's
            // definition is created by one runtime and executed by the other,
            // which fails inside ɵɵelementStart with a null internal table.
            dedupe: ["@angular/core", "@angular/common", "@angular/compiler", "@angular/platform-browser"],
            alias: {
                // Core aliases for playground imports
                "@avatar-core": resolve(__dirname, "../src/lib/core"),
                "@avatar-react": resolve(__dirname, "../src/packages/react"),
                "@avatar-angular": resolve(__dirname, "../src/packages/angular"),
                "@avatar-vue": resolve(__dirname, "../src/packages/vue"),
                "@avatar-svelte": resolve(__dirname, "../src/packages/svelte"),
                "@avatar-web-component": resolve(__dirname, "../src/packages/web-component"),
                "@avatar-style-initials": resolve(__dirname, "../src/lib/styles/initials"),
                "@avatar-style-geometric": resolve(__dirname, "../src/lib/styles/geometric"),
                "@avatar-style-pixels": resolve(__dirname, "../src/lib/styles/pixels"),
                "@avatar-style-rings": resolve(__dirname, "../src/lib/styles/rings"),
                "@avatar-style-faces": resolve(__dirname, "../src/lib/styles/faces"),
                "@avatar-style-illustrated": resolve(__dirname, "../src/lib/styles/illustrated"),
                "@avatar-style-anime": resolve(__dirname, "../src/lib/styles/anime"),
                "@avatar-style-abstract": resolve(__dirname, "../src/lib/styles/abstract"),
                "@avatar-style-emoji": resolve(__dirname, "../src/lib/styles/emoji"),
                "@avatar-style-animals": resolve(__dirname, "../src/lib/styles/animals"),
                "@avatar-style-gradient": resolve(__dirname, "../src/lib/styles/gradient"),
                // Package name aliases for internal imports between packages
                "@avatar-generator/core": resolve(__dirname, "../src/lib/core/src"),
                "@avatar-generator/react": resolve(__dirname, "../src/packages/react/src"),
                "@avatar-generator/angular": resolve(__dirname, "../src/packages/angular/src"),
                "@avatar-generator/vue": resolve(__dirname, "../src/packages/vue/src"),
                "@avatar-generator/svelte": resolve(__dirname, "../src/packages/svelte/src"),
                "@avatar-generator/web-component": resolve(__dirname, "../src/packages/web-component/src"),
                "@avatar-generator/style-initials": resolve(__dirname, "../src/lib/styles/initials/src"),
                "@avatar-generator/style-geometric": resolve(__dirname, "../src/lib/styles/geometric/src"),
                "@avatar-generator/style-pixels": resolve(__dirname, "../src/lib/styles/pixels/src"),
                "@avatar-generator/style-rings": resolve(__dirname, "../src/lib/styles/rings/src"),
                "@avatar-generator/style-faces": resolve(__dirname, "../src/lib/styles/faces/src"),
                "@avatar-generator/style-illustrated": resolve(__dirname, "../src/lib/styles/illustrated/src"),
                "@avatar-generator/style-anime": resolve(__dirname, "../src/lib/styles/anime/src"),
                "@avatar-generator/style-abstract": resolve(__dirname, "../src/lib/styles/abstract/src"),
                "@avatar-generator/style-emoji": resolve(__dirname, "../src/lib/styles/emoji/src"),
                "@avatar-generator/style-animals": resolve(__dirname, "../src/lib/styles/animals/src"),
                "@avatar-generator/style-gradient": resolve(__dirname, "../src/lib/styles/gradient/src"),
            },
        },
    };
});
