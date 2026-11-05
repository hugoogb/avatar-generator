import type { AvatarGroupItem, AvatarGroupOptions } from "./group";
import type { AvatarOptions } from "./types";

/** The viewer settings that an SVG inside `<img>` cannot see for itself. */
export interface ViewerPreferences {
    reducedMotion: boolean;
    moreContrast: boolean;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const MORE_CONTRAST = "(prefers-contrast: more)";

/** What to assume without a browser to ask, such as during a server render. */
export const NO_PREFERENCES: ViewerPreferences = { reducedMotion: false, moreContrast: false };

const hasMatchMedia = (): boolean => typeof matchMedia === "function";

/** Reads the viewer's settings. Returns {@link NO_PREFERENCES} without a browser. */
export function viewerPreferences(): ViewerPreferences {
    if (!hasMatchMedia()) return NO_PREFERENCES;
    return {
        reducedMotion: matchMedia(REDUCED_MOTION).matches,
        moreContrast: matchMedia(MORE_CONTRAST).matches,
    };
}

/**
 * Calls `listener` when the viewer's settings change.
 *
 * @returns A function that stops listening
 */
export function subscribeViewerPreferences(listener: () => void): () => void {
    if (!hasMatchMedia()) return () => {};

    const queries = [matchMedia(REDUCED_MOTION), matchMedia(MORE_CONTRAST)];
    for (const query of queries) query.addEventListener("change", listener);
    return () => {
        for (const query of queries) query.removeEventListener("change", listener);
    };
}

/**
 * Applies the viewer's settings to options bound for an `<img>`.
 *
 * An SVG inside `<img>` is its own document. Browsers do not reliably pass it
 * `prefers-reduced-motion` or `prefers-contrast` (Chromium, tested, does not),
 * so its embedded media queries cannot be trusted to honour them. The page can
 * read them, so it decides before the image exists: animation is dropped, and
 * `theme: "auto"` becomes the high-contrast theme.
 *
 * Every framework wrapper already does this. Call it yourself when assigning
 * `toDataUri()` to an `<img>` by hand. Inlined SVG does not need it.
 *
 * @example
 * ```ts
 * img.src = createAvatar(faces, adaptForImage({ seed, animation: true })).toDataUri();
 * ```
 */
export function adaptForImage<T extends AvatarOptions>(
    options: T,
    preferences: ViewerPreferences = viewerPreferences(),
): T {
    const adapted = { ...options };
    if (preferences.reducedMotion) adapted.animation = false;
    if (preferences.moreContrast && adapted.theme === "auto") adapted.theme = "high-contrast";
    return adapted;
}

/** {@link adaptForImage} for the arguments of `createAvatarGroup`. */
export function adaptGroupForImage<T extends AvatarOptions>(
    items: AvatarGroupItem<T>[],
    groupOptions: AvatarGroupOptions<T> = {},
    preferences: ViewerPreferences = viewerPreferences(),
): [AvatarGroupItem<T>[], AvatarGroupOptions<T>] {
    return [
        items.map((item) => (typeof item === "string" ? item : adaptForImage(item, preferences))),
        {
            ...groupOptions,
            options: groupOptions.options && adaptForImage(groupOptions.options as T, preferences),
        },
    ];
}
