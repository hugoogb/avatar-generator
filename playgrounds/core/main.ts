import { AvatarOptions, createAvatar } from "@avatar-core/src";
import { AVATAR_OPTIONS } from "../consts";

const app = document.getElementById("app");

if (app) {
    const avatarOptions: AvatarOptions[] = AVATAR_OPTIONS;

    avatarOptions.forEach((opt) => {
        const avatar = createAvatar(opt);
        app.appendChild(avatar);
    });
}
