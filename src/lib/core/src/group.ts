import { createAvatar } from "./create";
import { escapeXml, scopeSvgIds, toAvatarResult } from "./svg";
import type { AvatarOptions, AvatarResult, Style } from "./types";

/** A person in a group: a seed, or full options when they need their own. */
export type AvatarGroupItem<T extends AvatarOptions = AvatarOptions> = string | T;

/** Options for {@link createAvatarGroup}. */
export interface AvatarGroupOptions<T extends AvatarOptions = AvatarOptions> {
    /** Diameter of each avatar in pixels (default: 48). */
    size?: number;
    /** Fraction of each avatar covered by the next, from 0 to 0.9 (default: 0.25). */
    overlap?: number;
    /** Show at most this many avatars, then a `+N` badge. */
    max?: number;
    /** Width of the ring separating avatars, in pixels (default: 2). */
    ringWidth?: number;
    /** Ring colour. Match your page background (default: `#ffffff`). */
    ringColor?: string;
    /** Options applied to every avatar. An item's own options win. */
    options?: Partial<Omit<T, "seed" | "size">>;
    /** Background of the `+N` badge (default: `#E5E7EB`). */
    badgeColor?: string;
    /** Text of the `+N` badge (default: `#1F2933`). */
    badgeTextColor?: string;
    /** Accessible name. Defaults to a count, since a seed may be private. */
    title?: string;
}

/** The output of {@link createAvatarGroup}. */
export interface AvatarGroupResult extends AvatarResult {
    /** Width of the whole group in pixels. */
    width: number;
    /** Height of the whole group in pixels. */
    height: number;
    /** The accessible name, also suitable as `alt` text. */
    label: string;
}

/**
 * Renders a row of overlapping avatars, with a `+N` badge past `max`, as one SVG.
 *
 * @example
 * ```ts
 * const group = createAvatarGroup(faces, ["ana", "ben", "chi", "dee"], {
 *   size: 40,
 *   max: 3,
 *   title: "Ana, Ben and 2 others",
 * });
 * img.src = group.toDataUri();
 * img.width = group.width;
 * ```
 */
export function createAvatarGroup<T extends AvatarOptions>(
    style: Style<T>,
    items: AvatarGroupItem<T>[],
    groupOptions: AvatarGroupOptions<T> = {},
): AvatarGroupResult {
    const {
        size = 48,
        overlap = 0.25,
        max,
        ringWidth = 2,
        ringColor = "#ffffff",
        options: shared,
        badgeColor = "#E5E7EB",
        badgeTextColor = "#1F2933",
        title,
    } = groupOptions;

    if (overlap < 0 || overlap > 0.9) {
        throw new Error(`[@avatar-generator/core] Group overlap must be between 0 and 0.9, got ${overlap}.`);
    }
    if (max !== undefined && (!Number.isInteger(max) || max < 1)) {
        throw new Error(`[@avatar-generator/core] Group max must be a positive integer, got ${max}.`);
    }

    const visible = max === undefined ? items : items.slice(0, max);
    const hidden = items.length - visible.length;
    const slots = visible.length + (hidden > 0 ? 1 : 0);

    const step = size * (1 - overlap);
    const outer = size + ringWidth * 2;
    const width = slots === 0 ? 0 : outer + step * (slots - 1);
    const label = title ?? `${items.length} ${items.length === 1 ? "avatar" : "avatars"}`;
    const escapedLabel = escapeXml(label);

    // The ring is painted under each avatar rather than stroked around it, so it
    // also cuts the avatar into its neighbour instead of sitting on top of it.
    const center = outer / 2;
    const ring = (x: number, square: boolean) =>
        ringWidth === 0
            ? ""
            : square
              ? `<rect x="${x}" y="0" width="${outer}" height="${outer}" fill="${ringColor}"/>`
              : `<circle cx="${x + center}" cy="${center}" r="${center}" fill="${ringColor}"/>`;

    let body = "";
    visible.forEach((item, index) => {
        const own = typeof item === "string" ? ({ seed: item } as T) : item;
        const options = { ...shared, ...own, size } as T;
        const x = step * index;
        const { svg } = createAvatar(style, options);
        // Nested <svg> takes its position from x/y, and ids stay unique per slot.
        const nested = scopeSvgIds(svg, `g${index}`).replace("<svg ", `<svg x="${x + ringWidth}" y="${ringWidth}" `);
        body += ring(x, options.square === true) + nested;
    });

    if (hidden > 0) {
        const x = step * visible.length;
        const square = shared?.square === true;
        const badge = square
            ? `<rect x="${x + ringWidth}" y="${ringWidth}" width="${size}" height="${size}" fill="${badgeColor}"/>`
            : `<circle cx="${x + center}" cy="${center}" r="${size / 2}" fill="${badgeColor}"/>`;
        body +=
            ring(x, square) +
            badge +
            `<text x="${x + center}" y="${center}" font-family="sans-serif" font-size="${size * 0.36}" font-weight="600" ` +
            `fill="${badgeTextColor}" text-anchor="middle" dominant-baseline="central">+${hidden}</text>`;
    }

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${outer}" width="${width}" height="${outer}" ` +
        `role="img" aria-label="${escapedLabel}">` +
        (title ? `<title>${escapedLabel}</title>` : "") +
        body +
        "</svg>";

    return { ...toAvatarResult(svg), width, height: outer, label };
}
