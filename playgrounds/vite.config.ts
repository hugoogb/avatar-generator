import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
    const playground = mode || "core";

    return {
        root: resolve(__dirname, playground),
        resolve: {
            alias: {
                "@avatar-core": resolve(__dirname, "../src/lib/core"),
                "@avatar-react": resolve(__dirname, "../src/packages/react"),
            },
        },
    };
});
