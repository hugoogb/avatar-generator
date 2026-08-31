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
