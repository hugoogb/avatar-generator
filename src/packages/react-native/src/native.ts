import type { AvatarGroupItem, AvatarGroupOptions, AvatarOptions } from "@avatar-generator/core";
import * as React from "react";
import { AccessibilityInfo, Platform, useColorScheme, type EmitterSubscription } from "react-native";

/** The device settings that decide how an avatar renders on React Native. */
export interface NativePreferences {
    colorScheme: "light" | "dark";
    moreContrast: boolean;
}

interface ContrastSetting {
    read: () => Promise<boolean>;
    subscribe: (listener: (enabled: boolean) => void) => EmitterSubscription;
}

/** Each platform names its "more contrast" setting differently. */
function contrastSetting(): ContrastSetting | undefined {
    if (Platform.OS === "ios") {
        return {
            read: AccessibilityInfo.isDarkerSystemColorsEnabled,
            subscribe: (listener) => AccessibilityInfo.addEventListener("darkerSystemColorsChanged", listener),
        };
    }
    if (Platform.OS === "android") {
        return {
            read: AccessibilityInfo.isHighTextContrastEnabled,
            subscribe: (listener) => AccessibilityInfo.addEventListener("highTextContrastChanged", listener),
        };
    }
    return undefined;
}

/** Whether the viewer asked the OS for more contrast, kept current. */
function useMoreContrast(): boolean {
    const [moreContrast, setMoreContrast] = React.useState(false);

    React.useEffect(() => {
        const setting = contrastSetting();
        if (!setting) return;

        let active = true;
        void setting.read().then((enabled) => {
            if (active) setMoreContrast(enabled);
        });
        const subscription = setting.subscribe(setMoreContrast);
        return () => {
            active = false;
            subscription.remove();
        };
    }, []);

    return moreContrast;
}

/** The colour scheme and contrast setting of the device, kept current. */
export function useNativePreferences(): NativePreferences {
    const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
    const moreContrast = useMoreContrast();
    return React.useMemo(() => ({ colorScheme, moreContrast }), [colorScheme, moreContrast]);
}

/**
 * Adapts options for react-native-svg, which ignores `<style>`. Animation is
 * CSS, so it is turned off. `theme: "auto"` is CSS media queries too, so the
 * device settings pick the theme instead, with contrast winning as it does in
 * the core's CSS.
 */
export function adaptForNative<T extends AvatarOptions>(options: T, preferences: NativePreferences): T {
    const adapted = { ...options, animation: false };
    if (adapted.theme === "auto") {
        adapted.theme = preferences.moreContrast ? "high-contrast" : preferences.colorScheme;
    }
    return adapted;
}

/** {@link adaptForNative} for the arguments of `createAvatarGroup`. */
export function adaptGroupForNative<T extends AvatarOptions>(
    items: AvatarGroupItem<T>[],
    groupOptions: AvatarGroupOptions<T> = {},
    preferences: NativePreferences,
): [AvatarGroupItem<T>[], AvatarGroupOptions<T>] {
    return [
        items.map((item) => (typeof item === "string" ? item : adaptForNative(item, preferences))),
        {
            ...groupOptions,
            options: groupOptions.options && adaptForNative(groupOptions.options as T, preferences),
        },
    ];
}

/**
 * react-native-svg ignores `dominant-baseline`, which would lift centred text
 * (initials, the `+N` badge) above the middle. It implements
 * `alignment-baseline` with the same `central` value, so use that.
 */
export function toNativeXml(svg: string): string {
    return svg.replace(/dominant-baseline=/g, "alignment-baseline=");
}

/** Accessibility props for an avatar. An empty label marks it decorative. */
export function accessibilityProps(label: string) {
    return label === ""
        ? ({
              accessible: false,
              accessibilityElementsHidden: true,
              importantForAccessibility: "no-hide-descendants",
          } as const)
        : ({ accessible: true, accessibilityRole: "image", accessibilityLabel: label } as const);
}
