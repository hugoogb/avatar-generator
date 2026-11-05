import {
    adaptForImage,
    adaptGroupForImage,
    createAvatar,
    createAvatarGroup,
    createAvatarTransition,
    mixStyles,
    type AvatarOptions,
    type Style,
} from "@avatar-core/src";
import { geometric } from "@avatar-style-geometric/src";
import { initials } from "@avatar-style-initials/src";
import { pixels } from "@avatar-style-pixels/src";
import { rings } from "@avatar-style-rings/src";
import { faces } from "@avatar-style-faces/src";
import { illustrated } from "@avatar-style-illustrated/src";
import { anime } from "@avatar-style-anime/src";
import { abstract } from "@avatar-style-abstract/src";
import { emoji } from "@avatar-style-emoji/src";
import { animals } from "@avatar-style-animals/src";
import { gradient } from "@avatar-style-gradient/src";
import {
    GEOMETRIC_OPTIONS,
    INITIALS_OPTIONS,
    PIXELS_OPTIONS,
    RINGS_OPTIONS,
    FACES_OPTIONS,
    ILLUSTRATED_OPTIONS,
    ANIME_OPTIONS,
    ABSTRACT_OPTIONS,
    EMOJI_OPTIONS,
    ANIMALS_OPTIONS,
    GRADIENT_OPTIONS,
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
        { name: "Anime", style: anime, options: ANIME_OPTIONS },
        { name: "Abstract", style: abstract, options: ABSTRACT_OPTIONS },
        { name: "Emoji", style: emoji, options: EMOJI_OPTIONS },
        { name: "Animals", style: animals, options: ANIMALS_OPTIONS },
        { name: "Gradient", style: gradient, options: GRADIENT_OPTIONS },
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

    const section = (title: string, sources: string[]) => {
        const header = document.createElement("h2");
        header.textContent = title;
        header.style.marginTop = "20px";
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "16px";
        row.style.flexWrap = "wrap";
        row.style.alignItems = "center";
        for (const source of sources) {
            const img = document.createElement("img");
            img.src = source;
            img.alt = title;
            row.appendChild(img);
        }
        app.append(header, row);
    };

    const seeds = ["ana", "ben", "chi", "dee"];
    const size = 96;

    const mixed = mixStyles(faces, { hair: illustrated, eyes: anime });
    section(
        "Mixed: faces + illustrated hair + anime eyes",
        seeds.map((seed) => createAvatar(mixed, { seed, size }).toDataUri()),
    );

    section(
        "Idle animation",
        [faces, anime, illustrated, emoji].map((style) =>
            createAvatar(
                style as Style<AvatarOptions>,
                adaptForImage({ seed: "ana", size, animation: true }),
            ).toDataUri(),
        ),
    );

    section(
        "Themes: light, dark, high contrast, auto",
        (["light", "dark", "high-contrast", "auto"] as const).map((theme) =>
            createAvatar(initials, adaptForImage({ seed: "Ana Li", size, theme })).toDataUri(),
        ),
    );

    section("Group", [
        createAvatarGroup(faces, ...adaptGroupForImage<AvatarOptions>(seeds, { size: 56, max: 3 })).toDataUri(),
    ]);

    section("Transition between seeds", [
        createAvatarTransition(faces, { seed: "ana", size }, { seed: "ben", size }, { duration: 1500 }).toDataUri(),
    ]);
}
