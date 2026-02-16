import { createAvatar } from "@avatar-core/src";
import { geometric } from "@avatar-style-geometric/src";
import { initials } from "@avatar-style-initials/src";
import { pixels } from "@avatar-style-pixels/src";
import { rings } from "@avatar-style-rings/src";
import { faces } from "@avatar-style-faces/src";
import { illustrated } from "@avatar-style-illustrated/src";
import {
    GEOMETRIC_OPTIONS,
    INITIALS_OPTIONS,
    PIXELS_OPTIONS,
    RINGS_OPTIONS,
    FACES_OPTIONS,
    ILLUSTRATED_OPTIONS,
} from "../consts";

const app = document.getElementById("app");

if (app) {
    // Create style sections
    const styles = [
        { name: "Initials", style: initials, options: INITIALS_OPTIONS },
        { name: "Geometric (Identicon)", style: geometric, options: GEOMETRIC_OPTIONS },
        { name: "Pixels (Pixel Faces)", style: pixels, options: PIXELS_OPTIONS },
        { name: "Rings", style: rings, options: RINGS_OPTIONS },
        { name: "Faces", style: faces, options: FACES_OPTIONS },
        { name: "Illustrated", style: illustrated, options: ILLUSTRATED_OPTIONS },
    ];

    styles.forEach(({ name, style, options }) => {
        // Section header
        const header = document.createElement("h2");
        header.textContent = name;
        header.style.marginTop = "20px";
        app.appendChild(header);

        // Avatar container
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.gap = "16px";
        container.style.flexWrap = "wrap";
        container.style.alignItems = "center";

        options.forEach((opt) => {
            const avatar = createAvatar(style, opt);

            const img = document.createElement("img");
            img.src = avatar.toDataUri();
            img.alt = `${name} avatar`;
            img.style.borderRadius = opt.square ? "0" : "50%";

            container.appendChild(img);
        });

        app.appendChild(container);
    });
}
