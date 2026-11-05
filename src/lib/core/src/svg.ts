import { animationCss, animationRootAttributes, resolveAnimations } from "./animation";
import { hashSeed } from "./random";
import type { AvatarOptions, AvatarResult } from "./types";

/**
 * Skin tone palette for face-based avatar styles
 */
export const SKIN_TONES = ["#FFDBB4", "#EAC086", "#C68B59", "#A0674B", "#8D5524", "#613915"];

/**
 * Eye color palette for illustrated avatar styles
 */
export const EYE_COLORS = ["#634E34", "#2E536F", "#3D6B45", "#89724B", "#3B3024"];

/**
 * Natural hair colours for face-based styles. Kept apart from the background
 * palette, so hair cannot vanish into a background of the same colour.
 */
export const HAIR_COLORS = ["#231A14", "#3B2417", "#5A3A22", "#8A5A2B", "#C9973F", "#A8452A", "#8C8F96", "#1E2433"];

/**
 * Default background palette: saturated mid-tones that are distinct from each
 * other and from skin tones, and hold either white or near-black text at 4.5:1.
 */
export const DEFAULT_COLORS = [
    "#3B6FD9", // Blue
    "#6D5BD0", // Indigo
    "#C2478A", // Magenta
    "#E8705A", // Coral
    "#F2B84B", // Amber
    "#2A9D8F", // Teal
    "#4CAF6D", // Green
    "#3AA7D6", // Sky
    "#8E4FC0", // Purple
    "#C93C4A", // Red
];

/**
 * Escapes special characters for use in SVG text content
 */
export function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Creates the opening SVG tag with common attributes
 */
export function createSvgOpen(size: number, attributes = ""): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"${attributes}>`;
}

/**
 * Encodes an SVG string as a base64 data URI.
 *
 * `btoa` accepts only code points up to U+00FF and treats each as one byte. An
 * SVG with `李` in it made `btoa` throw, and one with `é` produced bytes that
 * are not valid UTF-8, so the browser refused to draw it. Encoding to UTF-8
 * first fixes both and leaves ASCII output unchanged.
 */
export function svgToDataUri(svg: string): string {
    const bytes = new TextEncoder().encode(svg);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/** Wraps a complete SVG string in the {@link AvatarResult} shape. */
export function toAvatarResult(svg: string): AvatarResult {
    return { svg, toDataUri: () => svgToDataUri(svg) };
}

/**
 * Prefixes every `id` in an SVG and every reference to one.
 *
 * Ids are global to the document an SVG sits in. When SVGs are nested or
 * inlined, a repeated id silently resolves to the first match, so a second
 * avatar can pick up the first one's gradient.
 */
export function scopeSvgIds(svg: string, prefix: string): string {
    return svg
        .replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
        .replace(/href="#([^"]+)"/g, `href="#${prefix}-$1"`);
}

/** Root attributes and leading elements for the accessibility options. */
export function accessibleMarkup(options: Pick<AvatarOptions, "title" | "description">): {
    attributes: string;
    children: string;
} {
    let attributes = "";
    let children = "";
    if (options.title) {
        const title = escapeXml(options.title);
        attributes += ` role="img" aria-label="${title}"`;
        children += `<title>${title}</title>`;
    }
    if (options.description) {
        children += `<desc>${escapeXml(options.description)}</desc>`;
    }
    return { attributes, children };
}

/**
 * Wraps a layer's markup in a class-bearing group when the options ask for
 * layer hooks. Otherwise returns it untouched, so output stays byte-identical.
 *
 * Styles built with `defineStyle` get this for free. A hand-written style can
 * call it around its eyes so that the `blink` animation reaches them.
 */
export function layerGroup(name: string, content: string, options: AvatarOptions): string {
    if (!content || (!options.classes && !resolveAnimations(options).blink)) return content;
    return `<g class="ag-layer ag-layer-${name}">${content}</g>`;
}

/**
 * Creates a circle clip path for rounded avatars
 */
export function createCircleClip(id: string, size: number): string {
    const r = size / 2;
    return `<clipPath id="${id}"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath>`;
}

/**
 * Creates a square clip path
 */
export function createSquareClip(id: string, size: number): string {
    return `<clipPath id="${id}"><rect x="0" y="0" width="${size}" height="${size}"/></clipPath>`;
}

/**
 * Creates a background rectangle
 */
export function createBackground(size: number, color: string, transparent = false): string {
    if (transparent) {
        return "";
    }
    return `<rect x="0" y="0" width="${size}" height="${size}" fill="${color}"/>`;
}

/**
 * Creates a border circle or rect
 */
export function createBorder(size: number, width: number, color: string, square: boolean): string {
    if (square) {
        const offset = width / 2;
        return `<rect x="${offset}" y="${offset}" width="${size - width}" height="${size - width}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
    }
    const r = size / 2 - width / 2;
    return `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
}

/**
 * Builds the transform attribute string from options
 */
export function buildTransform(options: AvatarOptions): string {
    const transforms: string[] = [];
    const center = (options.size ?? 64) / 2;

    if (options.rotate) {
        transforms.push(`rotate(${options.rotate} ${center} ${center})`);
    }

    if (options.flip) {
        transforms.push(`scale(-1, 1) translate(-${options.size ?? 64}, 0)`);
    }

    if (options.scale && options.scale !== 1) {
        const offset = center * (1 - options.scale);
        transforms.push(`translate(${offset}, ${offset}) scale(${options.scale})`);
    }

    return transforms.length > 0 ? ` transform="${transforms.join(" ")}"` : "";
}

/**
 * Wraps content with a group that applies transformations
 */
export function wrapWithTransform(content: string, options: AvatarOptions): string {
    const transform = buildTransform(options);
    if (!transform) {
        return content;
    }
    return `<g${transform}>${content}</g>`;
}

/** Options for {@link buildSvg}. */
export interface BuildSvgOptions {
    /**
     * Size of the coordinate space `content` was drawn in. Setting it keeps every
     * detail in proportion at any rendered size, so a style can use plain numbers.
     */
    canvas?: number;
}

/**
 * Wraps style-generated content into a complete SVG document with the right
 * viewBox, clip path (circle or square), background, transform group, and
 * optional border.
 *
 * Intended for style authors: call this at the end of your `create(options)`
 * implementation after building the inner content string.
 *
 * @param content - Raw SVG children produced by the style (no outer `<svg>`)
 * @param options - Base avatar options (seed, size, shape, transforms, border)
 * @param backgroundColor - Fill color for the background rectangle
 * @param buildOptions - See {@link BuildSvgOptions}
 * @returns An {@link AvatarResult} with the assembled SVG string
 */
export function buildSvg(
    content: string,
    options: AvatarOptions,
    backgroundColor: string,
    { canvas }: BuildSvgOptions = {},
): AvatarResult {
    const pixels = options.size ?? 64;
    const size = canvas ?? pixels;
    // Derive a deterministic clip id from the seed so identical options
    // always produce byte-identical SVG output.
    const clipId = `clip-${hashSeed(options.seed).toString(36)}`;

    const animations = resolveAnimations(options);
    const animated = animations.blink || animations.breathe;
    const accessible = accessibleMarkup(options);

    const rootClasses: string[] = [];
    if (options.classes) rootClasses.push("ag-avatar");
    if (typeof options.classes === "string") rootClasses.push(escapeXml(options.classes));
    if (animations.blink) rootClasses.push("ag-blink");
    if (animations.breathe) rootClasses.push("ag-breathe");

    let attributes = accessible.attributes;
    if (rootClasses.length > 0) attributes += ` class="${rootClasses.join(" ")}"`;
    if (animated) attributes += animationRootAttributes(options.seed);

    // A style drawing on a fixed canvas needs the viewBox and the rendered size
    // to differ. Without a canvas this is the same as `createSvgOpen(size)`.
    let svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${pixels}" height="${pixels}"${attributes}>` +
        accessible.children;

    if (animated) svg += `<style>${animationCss(animations)}</style>`;

    // Add defs with clip path
    svg += "<defs>";
    svg += options.square ? createSquareClip(clipId, size) : createCircleClip(clipId, size);
    svg += "</defs>";

    // Apply clip path to content group
    svg += `<g clip-path="url(#${clipId})">`;

    // Add background
    svg += createBackground(size, backgroundColor, options.transparent);

    // Add transformed content
    const transformed = wrapWithTransform(content, { ...options, size });
    svg += options.classes || animated ? `<g class="ag-content">${transformed}</g>` : transformed;

    svg += "</g>";

    // Add border if specified (outside clip)
    if (options.border) {
        // A border is asked for in real pixels, whatever the canvas.
        const width = (options.border.width * size) / pixels;
        svg += createBorder(size, width, options.border.color, options.square ?? false);
    }

    svg += "</svg>";

    return toAvatarResult(svg);
}
