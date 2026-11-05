/** Names a template needs in order to write valid code. */
export interface TemplateContext {
    /** npm package name, such as `@acme/avatar-style-cool`. */
    packageName: string;
    /** Style identifier, such as `cool`. */
    styleName: string;
    /** Name of the exported style, such as `cool`. */
    exportName: string;
    /** PascalCase prefix for types, such as `Cool`. */
    typeName: string;
}

/** A style starting point: the source of its `src/index.ts`. */
export interface StyleTemplate {
    /** Shown in `--help`. */
    description: string;
    /** Returns the source of `src/index.ts`. */
    source(context: TemplateContext): string;
}

const minimal: StyleTemplate = {
    description: "One layer. The smallest style that works",
    source: ({ styleName, exportName }) => `import { DEFAULT_COLORS, defineStyle } from "@avatar-generator/core";

/**
 * The ${styleName} avatar style.
 *
 * Add a layer per feature. Each one gets its own generator, so changing one
 * layer does not change what the seed picks for the others.
 */
export const ${exportName} = defineStyle({
    name: "${styleName}",
    layers: [
        {
            name: "shape",
            render: ({ cx, cy, size, random, options }) => {
                const fill = random.pick(options.colors ?? DEFAULT_COLORS);
                return \`<circle cx="\${cx}" cy="\${cy}" r="\${size * 0.3}" fill="\${fill}" opacity="0.8"/>\`;
            },
        },
    ],
});

export default ${exportName};
`,
};

const pattern: StyleTemplate = {
    description: "A seeded grid with its own option, for abstract styles",
    source: ({ styleName, exportName, typeName }) =>
        `import { DEFAULT_COLORS, defineStyle, type AvatarOptions } from "@avatar-generator/core";

export interface ${typeName}Options extends AvatarOptions {
    /** Cells per side (default: 5) */
    cells?: number;
}

/**
 * The ${styleName} avatar style: a mirrored grid, like a classic identicon.
 */
export const ${exportName} = defineStyle<${typeName}Options>({
    name: "${styleName}",
    validate(options) {
        const cells = options.cells ?? 5;
        if (!Number.isInteger(cells) || cells < 1) {
            throw new Error(\`[${styleName}] cells must be a positive integer, got \${cells}.\`);
        }
    },
    layers: [
        {
            name: "grid",
            render: ({ size, random, options }) => {
                const cells = options.cells ?? 5;
                const cell = size / cells;
                const fill = random.pick(options.colors ?? DEFAULT_COLORS);

                let markup = "";
                for (let row = 0; row < cells; row++) {
                    for (let col = 0; col < Math.ceil(cells / 2); col++) {
                        if (!random.bool()) continue;
                        const mirrored = cells - 1 - col;
                        for (const x of new Set([col, mirrored])) {
                            markup += \`<rect x="\${x * cell}" y="\${row * cell}" width="\${cell}" height="\${cell}" fill="\${fill}" opacity="0.7"/>\`;
                        }
                    }
                }
                return markup;
            },
        },
    ],
});

export default ${exportName};
`,
};

const face: StyleTemplate = {
    description: "Head, hair, eyes and mouth layers, mixable with the bundled faces",
    source: ({ styleName, exportName, typeName }) =>
        `import { DEFAULT_COLORS, defineStyle, SKIN_TONES, validateOption, type AvatarOptions } from "@avatar-generator/core";

export const EYE_STYLES = ["dots", "wide"] as const;
export type ${typeName}EyeStyle = (typeof EYE_STYLES)[number];

export interface ${typeName}Options extends AvatarOptions {
    /** Override the eye style */
    eyeStyle?: ${typeName}EyeStyle;
}

/** Choices that more than one layer depends on. */
export interface ${typeName}Traits {
    skin: string;
    hair: string;
    eyeStyle: ${typeName}EyeStyle;
}

/**
 * The ${styleName} avatar style.
 *
 * Features use the vocabulary the bundled face styles share — \`hair\`, \`head\`,
 * \`eyes\` and \`mouth\` — so \`mixStyles\` can trade them with \`faces\`,
 * \`illustrated\` and \`anime\`. The eyes layer also gets the \`blink\` animation.
 */
export const ${exportName} = defineStyle<${typeName}Options, ${typeName}Traits>({
    name: "${styleName}",
    validate(options) {
        validateOption("${styleName}", "eyeStyle", options.eyeStyle, EYE_STYLES);
    },
    prepare: (options, random) => ({
        skin: random.pick(SKIN_TONES),
        hair: random.pick(options.colors ?? DEFAULT_COLORS),
        eyeStyle: options.eyeStyle ?? random.pick([...EYE_STYLES]),
    }),
    // Tells mixStyles where the head is, so that features line up when traded.
    head: (size) => ({ x: size * 0.2, y: size * 0.2, width: size * 0.6, height: size * 0.6 }),
    layers: [
        {
            name: "head",
            render: ({ cx, cy, size, traits }) =>
                \`<circle cx="\${cx}" cy="\${cy}" r="\${size * 0.3}" fill="\${traits.skin}"/>\`,
        },
        {
            name: "hair-front",
            feature: "hair",
            render: ({ cx, cy, size, traits }) => {
                const r = size * 0.3;
                return \`<path d="M \${cx - r} \${cy} A \${r} \${r} 0 0 1 \${cx + r} \${cy} Z" fill="\${traits.hair}"/>\`;
            },
        },
        {
            name: "eyes",
            render: ({ cx, cy, size, traits }) => {
                const r = traits.eyeStyle === "wide" ? size * 0.05 : size * 0.03;
                const spacing = size * 0.11;
                const y = cy + size * 0.04;
                return (
                    \`<circle cx="\${cx - spacing}" cy="\${y}" r="\${r}" fill="#2C1810"/>\` +
                    \`<circle cx="\${cx + spacing}" cy="\${y}" r="\${r}" fill="#2C1810"/>\`
                );
            },
        },
        {
            name: "mouth",
            render: ({ cx, cy, size }) => {
                const y = cy + size * 0.16;
                const w = size * 0.08;
                return \`<path d="M \${cx - w} \${y} Q \${cx} \${y + w} \${cx + w} \${y}" fill="none" stroke="#2C1810" stroke-width="\${size * 0.025}" stroke-linecap="round"/>\`;
            },
        },
    ],
});

export default ${exportName};
`,
};

/** Every template, by the name `--template` takes. */
export const TEMPLATES = { minimal, pattern, face } satisfies Record<string, StyleTemplate>;

/** A name `--template` accepts. */
export type TemplateName = keyof typeof TEMPLATES;
