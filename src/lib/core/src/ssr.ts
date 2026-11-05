import { createAvatar } from "./create";
import { hashSeed } from "./random";
import { escapeXml, scopeSvgIds } from "./svg";
import type { AvatarOptions, Style } from "./types";

/** Options for {@link renderToString}. */
export interface RenderToStringOptions {
    /**
     * `img` (default) emits an `<img>` with a data URI, which is sandboxed from
     * the page. `inline` emits the `<svg>` itself: no second encoding, and your
     * CSS can reach it, but its markup becomes part of your page.
     */
    mode?: "img" | "inline";
    /** Alt text. An empty string marks the avatar as decorative. */
    alt?: string;
    /** Class for the emitted element. */
    className?: string;
    /** `loading` attribute for `img` mode. */
    loading?: "lazy" | "eager";
}

/**
 * URL-encodes only what a data URI requires. For SVG this is smaller than
 * base64, which adds a third, and it is the output that goes into every page.
 */
function urlEncodedDataUri(svg: string): string {
    const encoded = svg
        .replace(/%/g, "%25")
        .replace(/&/g, "%26")
        .replace(/#/g, "%23")
        .replace(/"/g, "'")
        .replace(/</g, "%3C")
        .replace(/>/g, "%3E")
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E]/gu, (char) => encodeURIComponent(char));
    return `data:image/svg+xml,${encoded}`;
}

/**
 * Renders an avatar to an HTML string, with no DOM and no framework.
 *
 * The output depends only on its inputs, so server and client markup match and
 * hydration has nothing to reconcile. Inline ids are derived from the avatar's
 * content, which keeps them stable between renders and distinct between avatars.
 *
 * @remarks A server cannot know the viewer's settings, and `<img>` may not see
 * them, so use `inline` mode for `animation` and `theme: "auto"`.
 *
 * `inline` mode puts the SVG into your page. Seeds and names are
 * escaped, but `colors` and similar options are written as attributes unchanged,
 * so do not pass untrusted values there. `img` mode has no such concern.
 *
 * @example
 * ```ts
 * const html = renderToString(faces, { seed: user.id, size: 48 }, { alt: user.name, loading: "lazy" });
 * ```
 */
export function renderToString<T extends AvatarOptions>(
    style: Style<T>,
    options: T,
    { mode = "img", alt = "Avatar", className, loading }: RenderToStringOptions = {},
): string {
    const { svg } = createAvatar(style, options);
    const size = options.size ?? 64;
    const classAttribute = className ? ` class="${escapeXml(className)}"` : "";

    if (mode === "inline") {
        const scoped = scopeSvgIds(svg, `ag${hashSeed(svg).toString(36)}`);
        const accessibility = alt ? ` role="img" aria-label="${escapeXml(alt)}"` : ` aria-hidden="true"`;
        // `title` already set role and aria-label; explicit alt wins by not
        // duplicating attributes, which is an HTML parse error.
        const stripped = scoped.replace(/^<svg([^>]*?) role="img" aria-label="[^"]*"/, "<svg$1");
        return stripped.replace("<svg ", `<svg${classAttribute}${accessibility} `);
    }

    const loadingAttribute = loading ? ` loading="${loading}"` : "";
    return (
        `<img src="${urlEncodedDataUri(svg)}" alt="${escapeXml(alt)}" width="${size}" height="${size}"` +
        `${classAttribute}${loadingAttribute}>`
    );
}
