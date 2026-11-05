import { createAvatar } from "./create";
import { createSvgOpen, scopeSvgIds, toAvatarResult } from "./svg";
import type { AvatarOptions, AvatarResult, Style } from "./types";

/** Options for {@link createAvatarTransition}. */
export interface AvatarTransitionOptions {
    /** Duration in milliseconds (default: 400). */
    duration?: number;
    /** CSS easing function (default: `ease-in-out`). */
    easing?: string;
}

/**
 * Renders one SVG that animates from one avatar to another, once, on load.
 *
 * The two drawings have unrelated shapes and element counts, so they cross-fade
 * rather than morph. When inlined, viewers who prefer reduced motion see only
 * `to`. Inside `<img>` the query may not apply, so check
 * `viewerPreferences().reducedMotion` first and render `to` directly if it is set.
 *
 * @example
 * ```ts
 * const next = createAvatarTransition(faces, { seed: previous, size: 64 }, { seed: current, size: 64 });
 * img.src = next.toDataUri();
 * ```
 *
 * @throws If the two avatars have different sizes, or `duration` is not positive
 */
export function createAvatarTransition<T extends AvatarOptions>(
    style: Style<T>,
    from: T,
    to: T,
    { duration = 400, easing = "ease-in-out" }: AvatarTransitionOptions = {},
): AvatarResult {
    const size = to.size ?? 64;
    if ((from.size ?? 64) !== size) {
        throw new Error(`[@avatar-generator/core] A transition needs one size, got ${from.size ?? 64} and ${size}.`);
    }
    if (!(duration > 0)) {
        throw new Error(`[@avatar-generator/core] Transition duration must be positive, got ${duration}.`);
    }
    if (!/^[\w\s(),.-]+$/.test(easing)) {
        throw new Error(`[@avatar-generator/core] Invalid transition easing: ${JSON.stringify(easing)}.`);
    }

    const timing = `${duration}ms ${easing} both`;
    const css =
        ".ag-transition-from{opacity:0}" +
        "@media (prefers-reduced-motion:no-preference){" +
        `.ag-transition-from{animation:ag-fade-out ${timing}}` +
        `.ag-transition-to{animation:ag-fade-in ${timing}}` +
        "@keyframes ag-fade-out{from{opacity:1}to{opacity:0}}" +
        "@keyframes ag-fade-in{from{opacity:0}to{opacity:1}}}";

    const fromSvg = scopeSvgIds(createAvatar(style, from).svg, "from");
    const toSvg = scopeSvgIds(createAvatar(style, to).svg, "to");

    return toAvatarResult(
        createSvgOpen(size) +
            `<style>${css}</style>` +
            `<g class="ag-transition-from">${fromSvg}</g>` +
            `<g class="ag-transition-to">${toSvg}</g>` +
            "</svg>",
    );
}
