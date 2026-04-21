import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            "@avatar-generator/core": here("./lib/core/src/index.ts"),
            "@avatar-generator/style-initials": here("./lib/styles/initials/src/index.ts"),
            "@avatar-generator/style-geometric": here("./lib/styles/geometric/src/index.ts"),
            "@avatar-generator/style-pixels": here("./lib/styles/pixels/src/index.ts"),
            "@avatar-generator/style-rings": here("./lib/styles/rings/src/index.ts"),
            "@avatar-generator/style-faces": here("./lib/styles/faces/src/index.ts"),
            "@avatar-generator/style-illustrated": here("./lib/styles/illustrated/src/index.ts"),
            "@avatar-generator/style-anime": here("./lib/styles/anime/src/index.ts"),
            "@avatar-generator/style-abstract": here("./lib/styles/abstract/src/index.ts"),
            "@avatar-generator/style-emoji": here("./lib/styles/emoji/src/index.ts"),
            "@avatar-generator/style-animals": here("./lib/styles/animals/src/index.ts"),
        },
    },
    test: {
        include: ["lib/**/test/**/*.test.ts", "packages/**/test/**/*.test.ts"],
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary", "html", "lcov"],
            include: ["lib/**/src/**", "packages/**/src/**"],
            exclude: ["**/dist/**", "**/node_modules/**", "**/*.d.ts"],
        },
    },
});
