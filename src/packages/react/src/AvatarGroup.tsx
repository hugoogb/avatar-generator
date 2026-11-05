import {
    adaptGroupForImage,
    createAvatarGroup,
    type AvatarGroupItem,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-generator/core";
import * as React from "react";
import { useViewerPreferences } from "./useViewerPreferences";

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
    /** Additional CSS class names */
    className?: string;
    /** Alt text. Defaults to `options.title`, then to a count */
    alt?: string;
}

/**
 * React component for a row of overlapping avatars.
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
    className,
    alt,
}: AvatarGroupProps<T>): React.ReactElement {
    const preferences = useViewerPreferences();
    const group = React.useMemo(
        () => createAvatarGroup(style, ...adaptGroupForImage(items, options, preferences)),
        [style, items, options, preferences],
    );

    return (
        <img
            src={group.toDataUri()}
            alt={alt ?? group.label}
            className={className}
            width={group.width}
            height={group.height}
        />
    );
}

export default AvatarGroup;
export { AvatarGroup };
export type { AvatarGroupProps };
