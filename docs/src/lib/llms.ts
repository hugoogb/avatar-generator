import { getCollection, type CollectionEntry } from "astro:content";

export const SITE_SUMMARY =
    "@avatar-generator is an open-source (MIT) JavaScript and TypeScript library that generates deterministic SVG avatars from any seed string. It has eleven styles, each in its own package, no runtime dependencies, and official components for React, Vue, Svelte and Angular, plus a custom element.";

const SECTIONS = [
    { heading: "Get started", prefix: "get-started/" },
    { heading: "Guides", prefix: "guides/" },
    { heading: "Reference", prefix: "reference/" },
];

export type DocSection = { heading: string; entries: CollectionEntry<"docs">[] };

/** Every docs page, grouped like the sidebar and in a stable order. */
export async function getDocSections(): Promise<DocSection[]> {
    const entries = await getCollection("docs");
    return SECTIONS.map(({ heading, prefix }) => ({
        heading,
        entries: entries.filter((entry) => entry.id.startsWith(prefix)).sort((a, b) => a.id.localeCompare(b.id)),
    }));
}

export function pageUrl(entry: CollectionEntry<"docs">, site: URL): string {
    return new URL(`/${entry.id}/`, site).href;
}

/** Reduce an MDX page to plain Markdown: no imports, no component tags, absolute links. */
export function toMarkdown(body: string, site: URL): string {
    return body
        .replace(/^import .*$/gm, "")
        .replace(
            /<Code\s+code=\{`([\s\S]*?)`\}\s+lang="(\w+)"\s*(?:><\/Code>|\/>)/g,
            (_, code: string, lang: string) => `\n\`\`\`${lang}\n${code}\n\`\`\`\n`,
        )
        .replace(/<\/?(?:Aside|Card|CardGrid|Code|Configurator|Gallery|Playground|Steps|TabItem|Tabs)\b[^>]*>/g, "")
        .replace(/\]\(\/(?!\/)/g, `](${site.origin}/`)
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
