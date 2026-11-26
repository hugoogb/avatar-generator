import type { AvatarOptions, ComposableStyle } from "@avatar-generator/core";
import { defineStyle } from "@avatar-generator/core";

// Placeholder while the artwork is drawn; replaced before release.

export type MarksOptions = AvatarOptions;

export const marks: ComposableStyle<MarksOptions, undefined> = defineStyle<MarksOptions>({
    name: "marks",
    canvas: 64,
    layers: [{ name: "placeholder", render: () => `<circle cx="32" cy="32" r="16" fill="#111111"/>` }],
});

export default marks;
