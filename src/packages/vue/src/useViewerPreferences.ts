import {
    NO_PREFERENCES,
    subscribeViewerPreferences,
    viewerPreferences,
    type ViewerPreferences,
} from "@avatar-generator/core";
import { onMounted, onUnmounted, shallowRef, type ShallowRef } from "vue";

/**
 * The viewer's settings, read on mount so that hydration matches the server's
 * markup, then kept current.
 */
export function useViewerPreferences(): ShallowRef<ViewerPreferences> {
    const preferences = shallowRef<ViewerPreferences>(NO_PREFERENCES);
    let stop = (): void => {};

    onMounted(() => {
        const update = (): void => {
            preferences.value = viewerPreferences();
        };
        update();
        stop = subscribeViewerPreferences(update);
    });
    onUnmounted(() => stop());

    return preferences;
}
