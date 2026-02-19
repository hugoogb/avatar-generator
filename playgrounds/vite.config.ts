import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const playground = mode || "core";

  return {
    root: resolve(__dirname, playground),
    plugins: playground === "react" ? [react()] : [],
    resolve: {
      alias: {
        // Core aliases for playground imports
        "@avatar-core": resolve(__dirname, "../src/lib/core"),
        "@avatar-react": resolve(__dirname, "../src/packages/react"),
        "@avatar-style-initials": resolve(__dirname, "../src/lib/styles/initials"),
        "@avatar-style-geometric": resolve(__dirname, "../src/lib/styles/geometric"),
        "@avatar-style-pixels": resolve(__dirname, "../src/lib/styles/pixels"),
        "@avatar-style-rings": resolve(__dirname, "../src/lib/styles/rings"),
        "@avatar-style-faces": resolve(__dirname, "../src/lib/styles/faces"),
        "@avatar-style-illustrated": resolve(__dirname, "../src/lib/styles/illustrated"),
        "@avatar-style-anime": resolve(__dirname, "../src/lib/styles/anime"),
        // Package name aliases for internal imports between packages
        "@avatar-generator/core": resolve(__dirname, "../src/lib/core/src"),
        "@avatar-generator/react": resolve(__dirname, "../src/packages/react/src"),
        "@avatar-generator/style-initials": resolve(__dirname, "../src/lib/styles/initials/src"),
        "@avatar-generator/style-geometric": resolve(__dirname, "../src/lib/styles/geometric/src"),
        "@avatar-generator/style-pixels": resolve(__dirname, "../src/lib/styles/pixels/src"),
        "@avatar-generator/style-rings": resolve(__dirname, "../src/lib/styles/rings/src"),
        "@avatar-generator/style-faces": resolve(__dirname, "../src/lib/styles/faces/src"),
        "@avatar-generator/style-illustrated": resolve(__dirname, "../src/lib/styles/illustrated/src"),
        "@avatar-generator/style-anime": resolve(__dirname, "../src/lib/styles/anime/src"),
      },
    },
  };
});
