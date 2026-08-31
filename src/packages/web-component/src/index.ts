import { register } from "./AvatarElement";

// Importing the package auto-registers the <avatar-generator> element.
// Users who want a different tag name can import { register } themselves.
register();

export { AvatarElement, register } from "./AvatarElement";
