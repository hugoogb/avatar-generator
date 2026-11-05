import { createRandom } from "./random";
import { buildSvg, DEFAULT_COLORS, layerGroup } from "./svg";
import type { AvatarOptions, ComposableStyle, HeadBox, LayerContext, LayerRender, Random, StyleLayer } from "./types";

/**
 * What {@link defineStyle} takes.
 *
 * @typeParam T - The style's options shape
 * @typeParam S - The traits `prepare` returns and every layer receives
 */
export interface StyleDefinition<T extends AvatarOptions = AvatarOptions, S = undefined> {
    /** Style identifier. */
    name: string;
    /** Layers in paint order, bottom first. */
    layers: StyleLayer<T, S>[];
    /**
     * Makes the choices several layers share, such as a skin tone used by both
     * the head and the ears. Receives its own generator seeded from `seed`.
     */
    prepare?(options: T, random: Random): S;
    /** Picks the background colour. Defaults to a pick from `options.colors`. */
    background?(options: T, random: Random): string;
    /** Rejects invalid options before anything draws. */
    validate?(options: T): void;
    /** Where this style draws its head, so that mixes can align to it. */
    head?(size: number): HeadBox;
    /**
     * Draw in a fixed coordinate space of this size, and let the SVG scale it.
     * Layers see this as `size`, so they can use plain numbers and every detail
     * stays in proportion at any rendered size.
     */
    canvas?: number;
}

function renderLayers<T extends AvatarOptions, S>(layers: StyleLayer<T, S>[], options: T, traits: S): string {
    const size = options.size ?? 64;
    let content = "";
    for (const layer of layers) {
        const context: LayerContext<T, S> = {
            options,
            traits,
            size,
            cx: size / 2,
            cy: size / 2,
            random: createRandom(`${options.seed}:${layer.name}`),
        };
        content += layerGroup(layer.name, layer.render(context), options);
    }
    return content;
}

function assemble<T extends AvatarOptions, S>(style: Omit<ComposableStyle<T, S>, "create">): ComposableStyle<T, S> {
    const composed: ComposableStyle<T, S> = {
        ...style,
        create(options) {
            composed.validate?.(options);
            const { canvas } = composed;
            const drawing = canvas === undefined ? options : { ...options, size: canvas };
            const traits = composed.prepare(drawing, createRandom(options.seed));
            // Its own stream: sharing one would tie the background to the first
            // thing `prepare` draws, so that a skin tone followed the background.
            const backgroundColor = composed.background(drawing, createRandom(`${options.seed}:background`));
            return buildSvg(renderLayers(composed.layers, drawing, traits), options, backgroundColor, { canvas });
        },
    };
    return composed;
}

/**
 * Creates a style from composable feature functions.
 *
 * Each layer draws one feature and gets a private generator, so adding or
 * changing a layer does not disturb what the seed picked for the others. The
 * result works with `createAvatar`, every framework wrapper and {@link mixStyles}.
 *
 * @example
 * ```ts
 * const dots = defineStyle({
 *   name: "dots",
 *   layers: [
 *     {
 *       name: "dot",
 *       render: ({ cx, cy, size, random, options }) =>
 *         `<circle cx="${cx}" cy="${cy}" r="${size / 4}" fill="${random.pick(options.colors ?? ["#fff"])}"/>`,
 *     },
 *   ],
 * });
 * createAvatar(dots, { seed: "user-42" });
 * ```
 */
export function defineStyle<T extends AvatarOptions = AvatarOptions, S = undefined>(
    definition: StyleDefinition<T, S>,
): ComposableStyle<T, S> {
    const seen = new Set<string>();
    for (const { name } of definition.layers) {
        if (seen.has(name)) {
            throw new Error(`[@avatar-generator/core] Style "${definition.name}" has two layers named "${name}".`);
        }
        seen.add(name);
    }

    return assemble<T, S>({
        name: definition.name,
        layers: definition.layers,
        prepare: definition.prepare ?? (() => undefined as S),
        background: definition.background ?? ((options, random) => random.pick(options.colors ?? DEFAULT_COLORS)),
        validate: definition.validate,
        head: definition.head,
        canvas: definition.canvas,
    });
}

// `any` is contained here: a mix holds styles whose option and trait types are
// unrelated to each other, and each donor only ever sees its own values.
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyComposableStyle = ComposableStyle<any, any>;

/**
 * Where a mixed feature comes from: another style, another style with its own
 * options, a function that draws it, or `null` to remove it.
 */
export type FeatureSource<T extends AvatarOptions = AvatarOptions> =
    AnyComposableStyle | { style: AnyComposableStyle; options?: Record<string, unknown> } | LayerRender<T, any> | null;
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Options for {@link mixStyles}. */
export interface MixOptions {
    /** Name of the resulting style. Defaults to `<base>-mix`. */
    name?: string;
}

/**
 * Options every style understands. Only these reach a donor: a base style's
 * `hairStyle: "flat-top"` means nothing to a donor with different hair, and its
 * own validation would rightly reject it.
 */
const SHARED_OPTIONS = [
    "seed",
    "size",
    "colors",
    "square",
    "transparent",
    "border",
    "rotate",
    "flip",
    "scale",
    "theme",
    "animation",
    "classes",
    "title",
    "description",
] as const satisfies readonly (keyof AvatarOptions)[];

function sharedOptions(options: AvatarOptions): Partial<AvatarOptions> {
    const shared: Record<string, unknown> = {};
    for (const key of SHARED_OPTIONS) {
        if (options[key] !== undefined) shared[key] = options[key];
    }
    return shared;
}

/** Rounded so that float noise cannot make the same mix differ across engines. */
const round = (value: number): number => Math.round(value * 10000) / 10000;

/** Wraps a donor's markup so that its head box lands on the base's. */
function alignToHead(markup: string, from: HeadBox | undefined, to: HeadBox | undefined): string {
    if (!markup || !from || !to) return markup;

    const scaleX = round(to.width / from.width);
    const scaleY = round(to.height / from.height);
    const x = round(to.x - from.x * scaleX);
    const y = round(to.y - from.y * scaleY);
    if (scaleX === 1 && scaleY === 1 && x === 0 && y === 0) return markup;

    return `<g transform="translate(${x} ${y}) scale(${scaleX} ${scaleY})">${markup}</g>`;
}

const featureNames = (style: AnyComposableStyle): string =>
    [...new Set(style.layers.map((layer) => layer.feature ?? layer.name))].join(", ");

/**
 * Builds a new style by taking features from other styles.
 *
 * - A style as the source takes that feature from it, with its own choices for
 *   the seed. A feature the base lacks is added on top.
 * - `{ style, options }` also passes options to that donor.
 * - A function replaces the feature with your own drawing.
 * - `null` removes the feature.
 *
 * Each donor decides independently from the same seed, so swapping one feature
 * never changes what the seed picked for another.
 *
 * @example
 * ```ts
 * const mixed = mixStyles(faces, {
 *   hair: illustrated,
 *   eyes: { style: anime, options: { eyeStyle: "sparkly" } },
 *   nose: null,
 *   mouth: ({ cx, cy, size }) => `<circle cx="${cx}" cy="${cy + size * 0.15}" r="2"/>`,
 * });
 * createAvatar(mixed, { seed: "user-42" });
 * ```
 *
 * @throws If a feature does not exist on the style it is taken from or replaces
 */
export function mixStyles<T extends AvatarOptions, S>(
    base: ComposableStyle<T, S>,
    features: Record<string, FeatureSource<T>>,
    mixOptions: MixOptions = {},
): ComposableStyle<T, unknown> {
    const name = mixOptions.name ?? `${base.name}-mix`;

    // Layers read their donor's traits and options out of this per-render
    // state, so the mixed style stays free of shared mutable state between calls.
    type MixedTraits = { base: S; donors: unknown[]; donorOptions: AvatarOptions[] };

    const donors: { style: AnyComposableStyle; options: Record<string, unknown> }[] = [];
    let layers: StyleLayer<T, MixedTraits>[] = base.layers.map((layer) => ({
        ...layer,
        render: (context) => layer.render({ ...context, traits: context.traits.base }),
    }));

    for (const [feature, source] of Object.entries(features)) {
        const present = layers.some((layer) => (layer.feature ?? layer.name) === feature);

        if (source === null || typeof source === "function") {
            if (!present) {
                throw new Error(
                    `[@avatar-generator/core] Cannot replace "${feature}": style "${base.name}" has no such feature. ` +
                        `It has: ${featureNames(base)}.`,
                );
            }
            let replaced = source === null;
            layers = layers.flatMap((layer) => {
                if ((layer.feature ?? layer.name) !== feature) return [layer];
                if (replaced || source === null) return [];
                replaced = true;
                return [
                    {
                        name: layer.name,
                        feature,
                        render: (context) => source({ ...context, traits: context.traits.base }),
                    },
                ];
            });
            continue;
        }

        const donor = "style" in source ? source.style : source;
        const donorOverrides = "style" in source ? (source.options ?? {}) : {};
        const donorLayers = donor.layers.filter((layer) => (layer.feature ?? layer.name) === feature);
        if (donorLayers.length === 0) {
            throw new Error(
                `[@avatar-generator/core] Cannot take "${feature}" from style "${donor.name}": it has no such feature. ` +
                    `It has: ${featureNames(donor)}.`,
            );
        }

        const donorIndex = donors.push({ style: donor, options: donorOverrides }) - 1;
        const adapt = (layer: StyleLayer): StyleLayer<T, MixedTraits> => ({
            name: layer.name,
            feature,
            render: (context) =>
                alignToHead(
                    layer.render({
                        ...context,
                        options: context.traits.donorOptions[donorIndex],
                        traits: context.traits.donors[donorIndex],
                    }),
                    donor.head?.(context.size),
                    base.head?.(context.size),
                ),
        });

        // A donor layer lands where the base draws the layer of the same name,
        // so hair-behind stays behind the head whichever style it came from.
        // A donor layer the base has no slot for goes straight after the feature.
        const byName = new Map(donorLayers.map((layer) => [layer.name, layer]));
        const placed = new Set<string>();
        const next: StyleLayer<T, MixedTraits>[] = [];
        let insertAt = -1;
        for (const layer of layers) {
            if ((layer.feature ?? layer.name) !== feature) {
                next.push(layer);
                continue;
            }
            const match = byName.get(layer.name);
            if (match) {
                placed.add(layer.name);
                next.push(adapt(match));
            }
            insertAt = next.length;
        }
        const extras = donorLayers.filter((layer) => !placed.has(layer.name)).map(adapt);
        next.splice(insertAt === -1 ? next.length : insertAt, 0, ...extras);
        layers = next;
    }

    // A caller only ever passes these traits back to the layers that produced
    // them, so what they contain is an internal detail of the mix.
    return assemble<T, MixedTraits>({
        name,
        layers,
        validate: (options) => {
            base.validate?.(options);
            for (const donor of donors) {
                donor.style.validate?.({ ...sharedOptions(options), ...donor.options });
            }
        },
        prepare: (options, random) => {
            const donorOptions = donors.map(
                (donor) => ({ ...sharedOptions(options), ...donor.options }) as unknown as AvatarOptions,
            );
            return {
                base: base.prepare(options, random),
                donors: donors.map((donor, index) =>
                    donor.style.prepare(donorOptions[index], createRandom(options.seed)),
                ),
                donorOptions,
            };
        },
        background: (options, random) => base.background(options, random),
        head: base.head,
        canvas: base.canvas,
    }) as unknown as ComposableStyle<T, unknown>;
}
