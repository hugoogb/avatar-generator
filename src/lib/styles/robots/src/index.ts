import type { AvatarOptions, ComposableStyle } from "@avatar-generator/core";
import { defineStyle } from "@avatar-generator/core";

// Placeholder while the artwork is drawn; replaced before release.

export type RobotsOptions = AvatarOptions;

export const robots: ComposableStyle<RobotsOptions, undefined> = defineStyle<RobotsOptions>({
    name: "robots",
    canvas: 64,
    layers: [{ name: "placeholder", render: () => `<circle cx="32" cy="32" r="16" fill="#111111"/>` }],
});

export default robots;
