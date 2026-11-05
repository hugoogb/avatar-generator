/**
 * Core type contracts shared by every avatar style.
 *
 * Style-specific option types live in their own packages — `FacesOptions` in
 * `@avatar-generator/style-faces`, and so on — so that adding a style does not
 * mean editing core.
 */

/**
 * Seeded random number generator used by every avatar style.
 *
 * All methods advance the sequence: calling the same method twice yields
 * different values. Two generators created from the same seed emit
 * identical sequences, which is the foundation of deterministic output.
 *
 * @see createRandom
 */
export interface Random {
    /** Returns the next random float in `[0, 1)`. */
    next(): number;
    /** Returns a random integer in `[min, max)`. */
    int(min: number, max: number): number;
    /**
     * Returns a random element from `array`.
     * @throws If `array` is empty.
     */
    pick<T>(array: T[]): T;
    /**
     * Returns `true` with the given probability, `false` otherwise.
     * @param probability - A number in `[0, 1]`. Defaults to `0.5`.
     */
    bool(probability?: number): boolean;
    /**
     * Shuffles `array` in place (Fisher-Yates) and returns it.
     * @remarks Mutates the input array.
     */
    shuffle<T>(array: T[]): T[];
}

/**
 * The output of {@link createAvatar}: a raw SVG string plus a data URI helper.
 */
export interface AvatarResult {
    /** The complete SVG markup, ready to insert into the DOM. */
    svg: string;
    /**
     * Returns the SVG as a `data:image/svg+xml;base64,…` URI suitable for
     * assigning directly to an `<img>` element's `src` attribute.
     */
    toDataUri(): string;
}

/**
 * Common options for all avatar styles
 */
export interface AvatarOptions {
    /** Seed for deterministic generation (any string) */
    seed: string;
    /** Size of the avatar in pixels (default: 64) */
    size?: number;
    /** Color palette to use (style-specific defaults if not provided) */
    colors?: string[];
    /** Use square shape instead of circle (default: false) */
    square?: boolean;
    /** Make background transparent (default: false) */
    transparent?: boolean;
    /** Border configuration */
    border?: {
        width: number;
        color: string;
    };
    /** Rotation in degrees (default: 0) */
    rotate?: number;
    /** Horizontal flip (default: false) */
    flip?: boolean;
    /** Scale factor (default: 1) */
    scale?: number;
    /**
     * Colour theme. A built-in name, your own {@link AvatarTheme}, or `"auto"`
     * to follow the viewer's `prefers-color-scheme` and `prefers-contrast`. As
     * with `animation`, contrast inside `<img>` needs {@link adaptForImage}.
     * An explicit `colors` or `border` takes precedence over the theme's.
     */
    theme?: AvatarThemeName | "auto" | AvatarTheme;
    /**
     * Idle animation. `true` enables every animation. Inlined SVG honours
     * `prefers-reduced-motion` by itself. Inside `<img>` it cannot, so the
     * framework wrappers handle it, and by hand you need {@link adaptForImage}.
     */
    animation?: boolean | IdleAnimation | IdleAnimation[];
    /**
     * Adds stable class names for your own CSS: `ag-avatar` on the root,
     * `ag-content` on the artwork and `ag-layer-<name>` on each layer. A string
     * is also added to the root. External CSS reaches these only when the SVG
     * is inlined, not through `<img>`.
     */
    classes?: boolean | string;
    /** Accessible name. Adds `<title>`, `role="img"` and `aria-label`. */
    title?: string;
    /** Longer accessible description. Adds `<desc>`. */
    description?: string;
}

/** Built-in theme names. */
export type AvatarThemeName = "light" | "dark" | "high-contrast";

/** An idle animation an avatar can run. */
export type IdleAnimation = "blink" | "breathe";

/**
 * A colour theme.
 *
 * Palettes of equal length keep an avatar recognisable across themes: the seed
 * picks the same palette slot in each, so only the colour changes.
 */
export interface AvatarTheme {
    /** Identifier, used in error messages. */
    name: string;
    /** Palette used in place of the style's default colours. */
    colors: string[];
    /** Colour drawn on top of the palette, such as initials text. */
    foreground?: string;
    /** Border applied when the caller does not set one. */
    border?: { width: number; color: string };
}

/**
 * Contract implemented by every avatar style package.
 *
 * Consumers typically never construct a `Style` directly; they import one of
 * the bundled implementations (`initials`, `faces`, `anime`, etc.) and pass it
 * to {@link createAvatar}. Authors of custom styles implement this interface.
 *
 * @typeParam T - The style's options shape, extending {@link AvatarOptions}
 */
export interface Style<T extends AvatarOptions = AvatarOptions> {
    /** Unique, human-readable style identifier (e.g. `"initials"`). */
    name: string;
    /** Produces an {@link AvatarResult} from the given options. */
    create(options: T): AvatarResult;
}

/**
 * Everything a layer needs in order to draw itself.
 *
 * @typeParam T - The style's options shape
 * @typeParam S - The traits returned by the style's `prepare`
 */
export interface LayerContext<T extends AvatarOptions = AvatarOptions, S = unknown> {
    /** The options the avatar was requested with. */
    options: T;
    /** The choices the style's `prepare` made for this seed. */
    traits: S;
    /** Avatar size in pixels. */
    size: number;
    /** Horizontal centre. */
    cx: number;
    /** Vertical centre. */
    cy: number;
    /** A generator private to this layer, so its draws cannot shift another's. */
    random: Random;
}

/** A function that draws part of an avatar and returns SVG markup. */
export type LayerRender<T extends AvatarOptions = AvatarOptions, S = unknown> = (context: LayerContext<T, S>) => string;

/** One named, ordered piece of a style's drawing. */
export interface StyleLayer<T extends AvatarOptions = AvatarOptions, S = unknown> {
    /** Unique within the style. Becomes the `ag-layer-<name>` class. */
    name: string;
    /**
     * The feature this layer belongs to, defaulting to `name`. Layers sharing a
     * feature are swapped together, such as hair behind and in front of a head.
     */
    feature?: string;
    /** Draws the layer. */
    render: LayerRender<T, S>;
}

/** A rectangle in avatar coordinates. */
export interface HeadBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * A style built from layers. Everything a plain {@link Style} does, plus the
 * parts {@link mixStyles} needs to take it apart.
 */
export interface ComposableStyle<T extends AvatarOptions = AvatarOptions, S = unknown> extends Style<T> {
    /** Layers in paint order, bottom first. */
    layers: StyleLayer<T, S>[];
    /** Makes the seed's choices once, before any layer draws. */
    prepare(options: T, random: Random): S;
    /** Picks the background colour. */
    background(options: T, random: Random): string;
    /** Rejects invalid options. */
    validate?(options: T): void;
    /**
     * Where this style draws its head. When both styles in a mix declare one,
     * donor layers are mapped onto the base's head, so that hair drawn for a
     * taller head does not float above a shorter one.
     */
    head?(size: number): HeadBox;
    /** Size of the coordinate space this style draws in, when it has a fixed one. */
    canvas?: number;
}

/**
 * Legacy v1 options for backwards compatibility
 * @deprecated Use AvatarOptions with a Style instead
 */
export interface LegacyAvatarOptions {
    name: string;
    backgroundColor?: string | string[];
    gradientDirection?: "vertical" | "horizontal";
    textColor?: string;
    fontSize?: string;
    shape?: "circle" | "square";
    width?: string;
    height?: string;
    tooltip?: boolean;
    additionalClasses?: string;
}
