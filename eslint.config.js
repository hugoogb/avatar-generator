import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "docs/**"],
    },
    {
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        },
    },
    {
        // Build and verification scripts run under Node, not in a browser.
        files: ["**/scripts/**/*.{js,mjs,ts}", "**/*.config.{js,mjs,mts,ts}"],
        languageOptions: {
            globals: globals.node,
        },
    },
);
