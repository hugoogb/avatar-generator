// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "@avatar-generator Docs",
      description: "Documentation for @avatar-generator components.",
      social: {
        github: "https://github.com/hugoogb/avatar-generator",
      },
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "get-started/introduction" },
            { label: "Installation", slug: "get-started/installation" },
            { label: "Playground", slug: "get-started/playground" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Manual Usage", slug: "guides/manual" },
            { label: "React Usage", slug: "guides/react" },
            { label: "Angular Usage", slug: "guides/angular" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
