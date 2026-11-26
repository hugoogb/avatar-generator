/**
 * Entry for the no-build browser bundle, `dist/avatar-generator.global.js`.
 *
 * One `<script>` tag defines `<avatar-generator>` and `<avatar-generator-group>`,
 * registers all eleven built-in styles for the `avatar-style` attribute, and
 * exposes core, the styles and the element helpers as `window.AvatarGenerator`.
 * The npm ESM and CommonJS builds do not include it.
 */
import { abstract } from "@avatar-generator/style-abstract";
import { animals } from "@avatar-generator/style-animals";
import { anime } from "@avatar-generator/style-anime";
import { emoji } from "@avatar-generator/style-emoji";
import { faces } from "@avatar-generator/style-faces";
import { geometric } from "@avatar-generator/style-geometric";
import { gradient } from "@avatar-generator/style-gradient";
import { illustrated } from "@avatar-generator/style-illustrated";
import { initials } from "@avatar-generator/style-initials";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";
import { register, registerGroup, registerStyle } from "./AvatarElement";

export const styles = {
    abstract,
    animals,
    anime,
    emoji,
    faces,
    geometric,
    gradient,
    illustrated,
    initials,
    pixels,
    rings,
};

// Styles first, so elements already in the page render as soon as they upgrade.
for (const style of Object.values(styles)) registerStyle(style);
register();
registerGroup();

export * from "@avatar-generator/core";
export { AvatarElement, AvatarGroupElement, register, registerGroup, registerStyle } from "./AvatarElement";
