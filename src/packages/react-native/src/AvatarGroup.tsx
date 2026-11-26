import {
    createAvatarGroup,
    type AvatarGroupItem,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-generator/core";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { accessibilityProps, adaptGroupForNative, toNativeXml, useNativePreferences } from "./native";

/**
 * Props for the AvatarGroup component
 */
interface AvatarGroupProps<T extends AvatarOptions> {
    /** The style every avatar in the group uses */
    style: Style<T>;
    /** The people in the group: seeds, or full options */
    items: AvatarGroupItem<T>[];
    /** Layout options such as `size`, `overlap` and `max` */
    options?: AvatarGroupOptions<T>;
    /** Layout styles for the rendered SVG view */
    containerStyle?: StyleProp<ViewStyle>;
    /** Accessibility label. Defaults to `options.title`, then to a count */
    alt?: string;
    /** Identifier for end-to-end tests */
    testID?: string;
}

/**
 * React Native component for a row of overlapping avatars.
 *
 * @example
 * ```tsx
 * <AvatarGroup style={faces} items={["ana", "ben", "chi", "dee"]} options={{ size: 40, max: 3 }} alt="Project team" />
 * ```
 */
function AvatarGroup<T extends AvatarOptions>({
    style,
    items,
    options,
    containerStyle,
    alt,
    testID,
}: AvatarGroupProps<T>): React.ReactElement {
    const preferences = useNativePreferences();
    const group = React.useMemo(
        () => createAvatarGroup(style, ...adaptGroupForNative(items, options, preferences)),
        [style, items, options, preferences],
    );
    const xml = React.useMemo(() => toNativeXml(group.svg), [group]);

    return (
        <SvgXml
            xml={xml}
            width={group.width}
            height={group.height}
            style={containerStyle}
            testID={testID}
            {...accessibilityProps(alt ?? group.label)}
        />
    );
}

export default AvatarGroup;
export { AvatarGroup };
export type { AvatarGroupProps };
