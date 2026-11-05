/**
 * A numbered sheet of every style, variant and platform feature, for reviewing
 * the artwork. Numbers follow the order below, so they stay the same between
 * reloads and whatever the size or page colour.
 *
 *   pnpm playground:gallery
 */
import {
    adaptForImage,
    createAvatar,
    createAvatarGroup,
    createAvatarTransition,
    createRandom,
    mixStyles,
    renderToString,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-core/src";
import { abstract, COMPOSITIONS } from "@avatar-style-abstract/src";
import { ANIMALS, animals } from "@avatar-style-animals/src";
import {
    anime,
    EYE_STYLES as ANIME_EYES,
    HAIR_STYLES as ANIME_HAIR,
    MOUTH_STYLES as ANIME_MOUTHS,
    NOSE_STYLES as ANIME_NOSES,
} from "@avatar-style-anime/src";
import { emoji, EXPRESSIONS } from "@avatar-style-emoji/src";
import {
    EYE_STYLES as FACES_EYES,
    faces,
    HAIR_STYLES as FACES_HAIR,
    MOUTH_STYLES as FACES_MOUTHS,
} from "@avatar-style-faces/src";
import { geometric } from "@avatar-style-geometric/src";
import { DIRECTIONS, gradient, PATTERNS } from "@avatar-style-gradient/src";
import {
    EYE_STYLES as ILLUSTRATED_EYES,
    EYEBROW_STYLES as ILLUSTRATED_BROWS,
    HAIR_STYLES as ILLUSTRATED_HAIR,
    illustrated,
    MOUTH_STYLES as ILLUSTRATED_MOUTHS,
    NOSE_STYLES as ILLUSTRATED_NOSES,
} from "@avatar-style-illustrated/src";
import { initials } from "@avatar-style-initials/src";
import { pixels } from "@avatar-style-pixels/src";
import { CENTER_STYLES, rings } from "@avatar-style-rings/src";

type AnyStyle = Style<AvatarOptions>;
const asStyle = (style: unknown): AnyStyle => style as AnyStyle;

const STYLES: [string, AnyStyle][] = [
    ["initials", asStyle(initials)],
    ["geometric", asStyle(geometric)],
    ["pixels", asStyle(pixels)],
    ["rings", asStyle(rings)],
    ["faces", asStyle(faces)],
    ["illustrated", asStyle(illustrated)],
    ["anime", asStyle(anime)],
    ["abstract", asStyle(abstract)],
    ["emoji", asStyle(emoji)],
    ["animals", asStyle(animals)],
    ["gradient", asStyle(gradient)],
];

const SEEDS = [
    "Ana Li",
    "ben@example.com",
    "Chi Nguyen",
    "user-42",
    "Dee Okafor",
    "Eli Cohen",
    "Fay Martin",
    "Gus Silva",
];

/** Draws one avatar at `size`, either as an `<img>` source or as markup. */
type Render = (size: number) => { src: string; width?: number; height?: number } | { html: string };

interface Item {
    label: string;
    render: Render;
    /** Fixed pixel size, for items that exist to show one size. */
    fixedSize?: number;
    stage?: "on-dark" | "on-light";
    replay?: boolean;
}

interface Section {
    title: string;
    note?: string;
    items: Item[];
}

const avatar = (style: AnyStyle, options: AvatarOptions & Record<string, unknown>): Render => {
    return (size) => ({ src: createAvatar(style, adaptForImage({ ...options, size })).toDataUri() });
};

const describe = (options: Record<string, unknown>): string => {
    const { seed, ...rest } = options;
    const details = Object.entries(rest).map(([key, value]) => `${key}: ${String(value)}`);
    return [seed, ...details].filter(Boolean).join(" · ");
};

const card = (style: AnyStyle, options: AvatarOptions & Record<string, unknown>): Item => ({
    label: describe(options),
    render: avatar(style, options),
});

/** One card for each value of an option. */
const variants = (
    style: unknown,
    option: string,
    values: readonly unknown[],
    base: Record<string, unknown> = {},
): Item[] => values.map((value) => card(asStyle(style), { seed: "Ana Li", ...base, [option]: value } as AvatarOptions));

/** Finds seeds whose `prepare` makes a given choice, as these options cannot be forced. */
const seedsWhere = (matches: (traits: ReturnType<typeof illustrated.prepare>) => boolean, count: number): string[] => {
    const found: string[] = [];
    for (let i = 0; i < 5000 && found.length < count; i++) {
        const seed = `person-${i}`;
        const rendered = illustrated.prepare({ seed, size: 64 }, createRandom(seed));
        if (matches(rendered)) found.push(seed);
    }
    return found;
};

const group = (label: string, style: AnyStyle, items: string[], options: AvatarGroupOptions): Item => ({
    label,
    render: (size) => {
        const result = createAvatarGroup(style, items, { ...options, size: Math.round(size * 0.6) });
        return { src: result.toDataUri(), width: result.width, height: result.height };
    },
});

const mix = (label: string, style: unknown, seed: string): Item => ({
    label: `${label} · ${seed}`,
    render: avatar(asStyle(style), { seed }),
});

const sections: Section[] = [
    ...STYLES.map(([name, style]): Section => ({
        title: `Style: ${name}`,
        note: "Different seeds, default options.",
        items: SEEDS.map((seed) => card(style, { seed })),
    })),

    { title: "Faces: hair", items: variants(faces, "hairStyle", FACES_HAIR) },
    { title: "Faces: eyes", items: variants(faces, "eyeStyle", FACES_EYES) },
    { title: "Faces: mouth", items: variants(faces, "mouthStyle", FACES_MOUTHS) },
    {
        title: "Faces: skin tones",
        items: ["#FFDBB4", "#EAC086", "#C68B59", "#A0674B", "#8D5524", "#613915"].flatMap((tone) =>
            ["Ana Li", "Dee Okafor"].map((seed) => ({
                label: `${seed} · ${tone}`,
                render: avatar(asStyle(faces), { seed, skinTones: [tone] } as AvatarOptions),
            })),
        ),
    },

    { title: "Illustrated: hair", items: variants(illustrated, "hairStyle", ILLUSTRATED_HAIR, { hat: false }) },
    { title: "Illustrated: eyes", items: variants(illustrated, "eyeStyle", ILLUSTRATED_EYES, { hat: false }) },
    { title: "Illustrated: eyebrows", items: variants(illustrated, "eyebrowStyle", ILLUSTRATED_BROWS, { hat: false }) },
    { title: "Illustrated: nose", items: variants(illustrated, "noseStyle", ILLUSTRATED_NOSES, { hat: false }) },
    { title: "Illustrated: mouth", items: variants(illustrated, "mouthStyle", ILLUSTRATED_MOUTHS, { hat: false }) },
    {
        title: "Illustrated: accessories",
        note: "Seeds that happen to pick each accessory.",
        items: (
            [
                ["round glasses", (t) => t.glassesType === "round"],
                ["square glasses", (t) => t.glassesType === "square"],
                ["aviators", (t) => t.glassesType === "aviator"],
                ["beanie", (t) => t.hatType === "beanie"],
                ["cap", (t) => t.hatType === "cap"],
                ["top hat", (t) => t.hatType === "tophat"],
                ["stubble", (t) => t.facialHairType === "stubble"],
                ["mustache", (t) => t.facialHairType === "mustache"],
                ["beard", (t) => t.facialHairType === "beard"],
                ["earrings", (t) => t.earringColor !== null],
            ] as [string, (t: ReturnType<typeof illustrated.prepare>) => boolean][]
        ).flatMap(([name, matches]) =>
            seedsWhere(matches, 2).map((seed) => ({
                label: `${name} · ${seed}`,
                render: avatar(asStyle(illustrated), { seed }),
            })),
        ),
    },

    { title: "Anime: hair, no bangs", items: variants(anime, "hairStyle", ANIME_HAIR, { bangs: false, ahoge: false }) },
    {
        title: "Anime: hair, with bangs",
        items: variants(anime, "hairStyle", ANIME_HAIR, { bangs: true, ahoge: false }),
    },
    { title: "Anime: eyes", items: variants(anime, "eyeStyle", ANIME_EYES) },
    { title: "Anime: mouth", items: variants(anime, "mouthStyle", ANIME_MOUTHS) },
    { title: "Anime: nose", items: variants(anime, "noseStyle", ANIME_NOSES) },

    { title: "Emoji: expressions", items: variants(emoji, "expression", EXPRESSIONS) },
    { title: "Animals: species", items: variants(animals, "animal", ANIMALS) },
    {
        title: "Animals: fur tones",
        items: ["#D4A574", "#A67B5B", "#7F5A3C", "#E8C89C", "#C88F5D"].flatMap((tone) =>
            (["cat", "dog", "bear"] as const).map((animal) => ({
                label: `${animal} · ${tone}`,
                render: avatar(asStyle(animals), { seed: "Ana Li", animal, furTones: [tone] } as AvatarOptions),
            })),
        ),
    },
    {
        title: "Pixels: more seeds",
        items: Array.from({ length: 12 }, (_, i) => card(asStyle(pixels), { seed: `pixel-${i}` })),
    },
    { title: "Rings: centres", items: variants(rings, "centerStyle", CENTER_STYLES) },
    {
        title: "Rings: more seeds",
        items: Array.from({ length: 8 }, (_, i) => card(asStyle(rings), { seed: `ring-${i}` })),
    },
    {
        title: "Abstract: compositions",
        items: COMPOSITIONS.flatMap((composition) =>
            ["Ana Li", "user-42", "Fay Martin"].map((seed) => card(asStyle(abstract), { seed, composition })),
        ),
    },
    {
        title: "Gradient: patterns and directions",
        items: PATTERNS.flatMap((pattern) =>
            DIRECTIONS.map((direction) =>
                card(asStyle(gradient), { seed: `${pattern}-${direction}`, pattern, direction }),
            ),
        ),
    },
    {
        title: "Initials: names",
        items: ["Ana Li", "ana.li@example.com", "Madonna", "José García", "李 小龙", "🙂 Ana", "user-42", "  "].map(
            (seed) => card(asStyle(initials), { seed }),
        ),
    },

    {
        title: "Small: 24px",
        note: "Fixed size, ignoring the size control. Where lists and comments use avatars.",
        items: STYLES.map(([name, style]) => ({
            label: name,
            fixedSize: 24,
            render: avatar(style, { seed: "Ana Li" }),
        })),
    },
    {
        title: "Small: 32px",
        note: "Fixed size, ignoring the size control.",
        items: STYLES.map(([name, style]) => ({
            label: name,
            fixedSize: 32,
            render: avatar(style, { seed: "Chi Nguyen" }),
        })),
    },
    {
        title: "Large: 192px",
        note: "Fixed size, ignoring the size control. Where profile pages use avatars.",
        items: STYLES.map(([name, style]) => ({
            label: name,
            fixedSize: 192,
            render: avatar(style, { seed: "Dee Okafor" }),
        })),
    },
    {
        title: "Transparent on a dark page",
        items: STYLES.map(([name, style]) => ({
            label: name,
            stage: "on-dark" as const,
            render: avatar(style, { seed: "Ana Li", transparent: true }),
        })),
    },
    {
        title: "Transparent on a white page",
        items: STYLES.map(([name, style]) => ({
            label: name,
            stage: "on-light" as const,
            render: avatar(style, { seed: "Ana Li", transparent: true }),
        })),
    },
    {
        title: "Square",
        items: STYLES.map(([name, style]) => ({
            label: name,
            render: avatar(style, { seed: "Eli Cohen", square: true }),
        })),
    },

    ...(["light", "dark", "high-contrast", "auto"] as const).map((theme): Section => ({
        title: `Theme: ${theme}`,
        note: theme === "auto" ? "Follows your system's light or dark setting." : undefined,
        items: STYLES.map(([name, style]) => ({ label: name, render: avatar(style, { seed: "Ana Li", theme }) })),
    })),

    {
        title: "Mixed styles",
        items: ["Ana Li", "Chi Nguyen", "Dee Okafor"].flatMap((seed) => [
            mix("faces + illustrated hair", mixStyles(faces, { hair: illustrated }), seed),
            mix("faces + anime eyes", mixStyles(faces, { eyes: anime }), seed),
            mix("illustrated + anime eyes", mixStyles(illustrated, { eyes: anime }), seed),
            mix("illustrated + faces hair", mixStyles(illustrated, { hair: faces }), seed),
            mix("anime + illustrated hair", mixStyles(anime, { hair: illustrated }), seed),
            mix("anime + faces mouth", mixStyles(anime, { mouth: faces }), seed),
            mix("faces + glasses, no nose", mixStyles(faces, { glasses: illustrated, nose: null }), seed),
        ]),
    },

    {
        title: "Animation: blink and breathe",
        note: "Runs inside <img>. Blinks are brief, so watch for a few seconds.",
        items: STYLES.map(([name, style]) => ({
            label: name,
            render: avatar(style, { seed: "Fay Martin", animation: true }),
        })),
    },
    {
        title: "Transitions between seeds",
        note: "Plays once. Use Replay transitions in the header.",
        items: (["faces", "illustrated", "anime", "gradient"] as const).map((name) => {
            const style = STYLES.find(([candidate]) => candidate === name)?.[1] as AnyStyle;
            return {
                label: name,
                replay: true,
                render: (size: number) => ({
                    src: createAvatarTransition(
                        style,
                        { seed: "Ana Li", size },
                        { seed: "Dee Okafor", size },
                        { duration: 1500 },
                    ).toDataUri(),
                }),
            };
        }),
    },

    {
        title: "Avatar groups",
        items: [
            group("faces · max 4", asStyle(faces), SEEDS, { max: 4 }),
            group("illustrated · all", asStyle(illustrated), SEEDS.slice(0, 5), {}),
            group("anime · overlap 0.4", asStyle(anime), SEEDS.slice(0, 4), { overlap: 0.4 }),
            group("initials · max 3", asStyle(initials), SEEDS, { max: 3 }),
            group("geometric · square", asStyle(geometric), SEEDS, { max: 3, options: { square: true } }),
            group("emoji · no ring", asStyle(emoji), SEEDS.slice(0, 4), { ringWidth: 0 }),
            group("animals · dark ring", asStyle(animals), SEEDS.slice(0, 4), { ringColor: "#111827" }),
        ],
    },

    {
        title: "Borders",
        items: STYLES.map(([name, style]) => ({
            label: name,
            render: avatar(style, { seed: "Gus Silva", border: { width: 3, color: "#111827" } }),
        })),
    },
    {
        title: "Inline SVG, from renderToString",
        note: "Same artwork as <img>. Any difference from the Style sections is a bug.",
        items: STYLES.map(([name, style]) => ({
            label: name,
            render: (size: number) => ({
                html: renderToString(style, { seed: "Ana Li", size }, { mode: "inline", alt: name }),
            }),
        })),
    },

    // New sections go at the end, so that numbers already reviewed do not move.
    {
        title: "Faces: hair on each head shape",
        note: "Seeds that happen to pick each head shape.",
        items: (["circle", "square", "rounded-square"] as const).flatMap((shape) => {
            let index = 0;
            let seed = "shape-0";
            while (faces.prepare({ seed, size: 64 }, createRandom(seed)).faceShape !== shape) seed = `shape-${++index}`;
            return FACES_HAIR.map((hairStyle) => ({
                label: `${shape} · ${hairStyle}`,
                render: avatar(asStyle(faces), { seed, hairStyle, skinTones: ["#EAC086"] } as AvatarOptions),
            }));
        }),
    },
];

// ---- Rendering --------------------------------------------------------------

const app = document.getElementById("app") as HTMLElement;
const jump = document.getElementById("jump") as HTMLSelectElement;
const sizeControl = document.getElementById("size") as HTMLSelectElement;
const pageControl = document.getElementById("page") as HTMLSelectElement;
const find = document.getElementById("find") as HTMLInputElement;

for (const value of [64, 96, 128, 160])
    sizeControl.add(new Option(`${value}px`, String(value), value === 96, value === 96));
for (const value of ["light", "dark"]) pageControl.add(new Option(value, value));

function paint(stage: HTMLElement, item: Item, size: number): void {
    const drawn = item.fixedSize ?? size;
    const result = item.render(drawn);
    if ("html" in result) {
        stage.innerHTML = result.html;
        return;
    }
    const image = new Image();
    image.src = result.src;
    image.alt = item.label;
    image.width = result.width ?? drawn;
    image.height = result.height ?? drawn;
    stage.replaceChildren(image);
}

function renderAll(): void {
    const size = Number(sizeControl.value);
    let number = 0;
    app.replaceChildren();
    jump.replaceChildren(new Option("Jump to…", ""));

    sections.forEach((section, index) => {
        const heading = document.createElement("h2");
        heading.id = `section-${index}`;
        heading.textContent = section.title;
        app.append(heading);
        jump.add(new Option(`${section.title} (#${number + 1})`, heading.id));

        if (section.note) {
            const note = document.createElement("p");
            note.className = "note";
            note.textContent = section.note;
            app.append(note);
        }

        const grid = document.createElement("div");
        grid.className = "grid";
        for (const item of section.items) {
            number++;
            const element = document.createElement("article");
            element.className = "card";
            element.id = `item-${number}`;

            const badge = document.createElement("span");
            badge.className = "number";
            badge.textContent = `#${number}`;

            const stage = document.createElement("div");
            stage.className = `stage ${item.stage ?? ""}`;
            if (item.replay) stage.dataset.replay = "true";
            paint(stage, item, size);

            const label = document.createElement("span");
            label.className = "label";
            label.textContent = item.label;

            element.append(badge, stage, label);
            grid.append(element);
        }
        app.append(grid);
    });

    (document.getElementById("total") as HTMLElement).textContent = `${number} items`;
    find.max = String(number);
}

sizeControl.addEventListener("change", renderAll);
pageControl.addEventListener("change", () => {
    document.body.dataset.page = pageControl.value;
});
jump.addEventListener("change", () => {
    document.getElementById(jump.value)?.scrollIntoView();
});
find.addEventListener("change", () => {
    document.querySelector(".card.found")?.classList.remove("found");
    const target = document.getElementById(`item-${find.value}`);
    target?.classList.add("found");
    target?.scrollIntoView({ block: "center" });
});
(document.getElementById("replay") as HTMLElement).addEventListener("click", () => {
    // An SVG image restarts its animations when the image is loaded afresh.
    for (const image of document.querySelectorAll<HTMLImageElement>('[data-replay="true"] img')) {
        const { src } = image;
        image.src = "";
        image.src = src;
    }
});

renderAll();
