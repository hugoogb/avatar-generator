// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const SITE = "https://avatar-generator.hugoogb.dev";
const OG_IMAGE = `${SITE}/og.png`;
const DESCRIPTION =
    "Open-source JavaScript library that generates deterministic SVG avatars in eleven styles, for React, Vue, Svelte, Angular, web components and plain JS.";

// The @id values point at the entities hugoogb.dev already publishes, so search
// engines can join this site and the portfolio into one author and project.
const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": `${SITE}/#website`,
            url: `${SITE}/`,
            name: "@avatar-generator",
            description: DESCRIPTION,
            inLanguage: "en",
            publisher: { "@id": "https://hugoogb.dev/#person" },
        },
        {
            "@type": "SoftwareSourceCode",
            "@id": `${SITE}/#software`,
            name: "@avatar-generator",
            description: DESCRIPTION,
            url: `${SITE}/`,
            image: OG_IMAGE,
            codeRepository: "https://github.com/hugoogb/avatar-generator",
            programmingLanguage: "TypeScript",
            runtimePlatform: "JavaScript",
            license: "https://opensource.org/license/mit",
            creator: { "@id": "https://hugoogb.dev/#person" },
            sameAs: ["https://github.com/hugoogb/avatar-generator", "https://www.npmjs.com/org/avatar-generator"],
        },
        {
            "@type": "Person",
            "@id": "https://hugoogb.dev/#person",
            name: "Hugo García Benjumea",
            url: "https://hugoogb.dev/",
            sameAs: ["https://github.com/hugoogb"],
        },
    ],
};

// https://astro.build/config
export default defineConfig({
    // Starlight needs this to emit canonical URLs, og:url and the sitemap.
    site: SITE,
    // Every page lives at a trailing-slash URL. docs/vercel.json makes Vercel 308 the
    // slash-less form, so Google never sees two URLs for one page.
    trailingSlash: "always",
    integrations: [
        starlight({
            title: "@avatar-generator",
            description: DESCRIPTION,
            components: {
                Footer: "./src/components/Footer.astro",
            },
            head: [
                { tag: "meta", attrs: { property: "og:image", content: OG_IMAGE } },
                { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
                { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
                {
                    tag: "meta",
                    attrs: {
                        property: "og:image:alt",
                        content: "@avatar-generator: deterministic SVG avatars for JavaScript, in eleven styles",
                    },
                },
                { tag: "meta", attrs: { name: "twitter:image", content: OG_IMAGE } },
                {
                    tag: "script",
                    attrs: { type: "application/ld+json" },
                    content: JSON.stringify(structuredData),
                },
            ],
            social: {
                github: "https://github.com/hugoogb/avatar-generator",
            },
            sidebar: [
                {
                    label: "Start Here",
                    items: [
                        { label: "Introduction", slug: "get-started/introduction" },
                        { label: "Comparison", slug: "get-started/comparison" },
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
                        { label: "Vue Usage", slug: "guides/vue" },
                        { label: "Svelte Usage", slug: "guides/svelte" },
                        { label: "Web Component Usage", slug: "guides/web-component" },
                        { label: "Creating Custom Styles", slug: "guides/custom-styles" },
                        { label: "Mixing Styles", slug: "guides/mixing-styles" },
                        { label: "Animation", slug: "guides/animation" },
                        { label: "Themes & Accessibility", slug: "guides/theming-accessibility" },
                        { label: "Avatar Groups", slug: "guides/avatar-group" },
                        { label: "Server-Side Rendering", slug: "guides/ssr" },
                        { label: "Cookbook", slug: "guides/cookbook" },
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
