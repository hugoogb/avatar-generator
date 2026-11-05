import { register, registerGroup } from "./AvatarElement";

// Importing the package auto-registers the <avatar-generator> element.
// Users who want a different tag name can import { register } themselves.
register();
registerGroup();

export { AvatarElement, AvatarGroupElement, register, registerGroup } from "./AvatarElement";
