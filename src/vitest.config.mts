import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
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
