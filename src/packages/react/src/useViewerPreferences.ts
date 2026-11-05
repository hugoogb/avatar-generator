import {
    NO_PREFERENCES,
    subscribeViewerPreferences,
    viewerPreferences,
    type ViewerPreferences,
} from "@avatar-generator/core";
import * as React from "react";

/** A snapshot must be referentially stable, so cache one object per state. */
const SNAPSHOTS: Record<string, ViewerPreferences> = {};

function getSnapshot(): ViewerPreferences {
    const current = viewerPreferences();
    const key = `${current.reducedMotion}:${current.moreContrast}`;
    return (SNAPSHOTS[key] ??= current);
}

/**
 * The viewer's settings, kept current. During hydration React uses the server
 * snapshot, so markup matches the server's, then re-renders with the real value.
 */
export function useViewerPreferences(): ViewerPreferences {
    return React.useSyncExternalStore(subscribeViewerPreferences, getSnapshot, () => NO_PREFERENCES);
}
