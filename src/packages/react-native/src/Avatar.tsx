import { createAvatar, type AvatarOptions, type Style } from "@avatar-generator/core";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { accessibilityProps, adaptForNative, toNativeXml, useNativePreferences } from "./native";

/**
 * Props for the Avatar component
 */
interface AvatarProps<T extends AvatarOptions> {
    /** The style to use for generating the avatar */
    style: Style<T>;
    /** Options for the avatar (varies by style) */
    options: T;
    /** Layout styles for the rendered SVG view */
    containerStyle?: StyleProp<ViewStyle>;
    /** Accessibility label. `""` marks the avatar decorative */
    alt?: string;
    /** Identifier for end-to-end tests */
    testID?: string;
}

/**
 * React Native component for rendering avatars with react-native-svg.
 *
 * @example
 * ```tsx
 * import { Avatar } from '@avatar-generator/react-native';
 * import { initials } from '@avatar-generator/style-initials';
 *
 * <Avatar style={initials} options={{ seed: user.id, name: user.name, size: 48 }} alt={user.name} />
 * ```
 */
function Avatar<T extends AvatarOptions>({
    style,
    options,
    containerStyle,
    alt,
    testID,
}: AvatarProps<T>): React.ReactElement {
    const preferences = useNativePreferences();
    const xml = React.useMemo(
        () => toNativeXml(createAvatar(style, adaptForNative(options, preferences)).svg),
        [style, options, preferences],
    );
    const size = options.size ?? 64;

    return (
        <SvgXml
            xml={xml}
            width={size}
            height={size}
            style={containerStyle}
            testID={testID}
            {...accessibilityProps(alt ?? "Avatar")}
        />
    );
}

export default Avatar;
export { Avatar };
export type { AvatarProps };
