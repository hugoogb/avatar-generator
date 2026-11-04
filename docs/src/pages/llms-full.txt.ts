import type { APIRoute } from "astro";
import { getDocSections, pageUrl, SITE_SUMMARY, toMarkdown } from "../lib/llms";

export const GET: APIRoute = async ({ site }) => {
    const sections = await getDocSections();
    const pages = sections.flatMap(({ entries }) =>
        entries.map(
            (entry) =>
                `# ${entry.data.title}\n\nSource: ${pageUrl(entry, site!)}\n\n${toMarkdown(entry.body ?? "", site!)}`,
        ),
    );
    const body = [`# @avatar-generator\n\n> ${SITE_SUMMARY}`, ...pages].join("\n\n---\n\n");
    return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
