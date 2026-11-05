import { adaptForImage, createAvatar, type AvatarOptions, type AvatarResult, type Style } from "@avatar-generator/core";
import { useViewerPreferences } from "./useViewerPreferences";
import * as React from "react";

/**
 * Props for the Avatar component
 */
interface AvatarProps<T extends AvatarOptions> {
    /** The style to use for generating the avatar */
    style: Style<T>;
    /** Options for the avatar (varies by style) */
    options: T;
    /** Additional CSS class names */
    className?: string;
    /** Alt text for accessibility */
    alt?: string;
}

/**
 * React component for rendering avatars
 *
 * @example
 * ```tsx
 * import { Avatar } from '@avatar-generator/react';
 * import { initials } from '@avatar-generator/style-initials';
 *
 * function UserAvatar({ name }: { name: string }) {
 *   return (
 *     <Avatar
 *       style={initials}
 *       options={{ seed: name, size: 48 }}
 *       alt={name}
 *     />
 *   );
 * }
 * ```
 */
function Avatar<T extends AvatarOptions>({ style, options, className, alt }: AvatarProps<T>): React.ReactElement {
    const preferences = useViewerPreferences();
    const avatar: AvatarResult = React.useMemo(
        () => createAvatar(style, adaptForImage(options, preferences)),
        [style, options, preferences],
    );

    return (
        <img
            src={avatar.toDataUri()}
            alt={alt ?? "Avatar"}
            className={className}
            width={options.size ?? 64}
            height={options.size ?? 64}
        />
    );
}

export default Avatar;
export { Avatar };
export type { AvatarProps };
