import type { APIRoute } from "astro";
import { getDocSections, pageUrl, SITE_SUMMARY } from "../lib/llms";

export const GET: APIRoute = async ({ site }) => {
    const sections = await getDocSections();
    const lines = [
        "# @avatar-generator",
        "",
        `> ${SITE_SUMMARY}`,
        "",
        `The complete documentation as one file: ${new URL("/llms-full.txt", site).href}`,
        "",
        ...sections.flatMap(({ heading, entries }) => [
            `## ${heading}`,
            "",
            ...entries.map(
                (entry) => `- [${entry.data.title}](${pageUrl(entry, site!)}): ${entry.data.description ?? ""}`,
            ),
            "",
        ]),
    ];
    return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
