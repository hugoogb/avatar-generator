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
 * Style-specific options extend base options
 */
export interface InitialsOptions extends AvatarOptions {
    /** Name to extract initials from (defaults to seed) */
    name?: string;
    /** Font family (default: sans-serif) */
    fontFamily?: string;
    /** Font weight (default: 600) */
    fontWeight?: number;
    /** Text color (default: #fff) */
    textColor?: string;
}

export interface GeometricOptions extends AvatarOptions {
    /** Grid size (default: 5, odd recommended) */
    gridSize?: number;
    /** Padding cells around the pattern (default: 1) */
    padding?: number;
    /** Override foreground color (otherwise picked from palette) */
    foregroundColor?: string;
}

export interface PixelsOptions extends AvatarOptions {
    /** Pixel grid size (default: 8) */
    pixelSize?: number;
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Enable accessories like glasses (default: true) */
    accessories?: boolean;
    /** Override feature color (eyes, mouth) */
    featureColor?: string;
}

export type RingsCenterStyle = "solid" | "dot" | "ring" | "diamond" | "none";

export interface RingsOptions extends AvatarOptions {
    /** Number of rings (default: 4) */
    ringCount?: number;
    /** Gap between rings (default: 2) */
    ringGap?: number;
    /** Allow segmented rings (default: true) */
    segmented?: boolean;
    /** Allow dashed rings (default: true) */
    dashed?: boolean;
    /** Center decoration style (default: "solid") */
    centerStyle?: RingsCenterStyle;
}

// ─── Faces style option unions ────────────────────────────────────────────

export type FacesHairStyle = "none" | "flat-top" | "cap" | "side-swept" | "spiky" | "round-top" | "mohawk" | "beanie";

export type FacesEyeStyle = "dots" | "rectangles" | "lines" | "round";

export type FacesMouthStyle = "line" | "rect-smile" | "open-rect" | "zigzag" | "dot";

export interface FacesOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Override feature color (eyes, mouth, eyebrows) */
    featureColor?: string;
    /** Enable eyebrows (default: true) */
    eyebrows?: boolean;
    /** Enable ears (default: true) */
    ears?: boolean;
    /** Enable nose (default: true) */
    nose?: boolean;
    /** Override mouth style */
    mouthStyle?: FacesMouthStyle;
    /** Override eye style */
    eyeStyle?: FacesEyeStyle;
    /** Override hair style */
    hairStyle?: FacesHairStyle;
}

// ─── Illustrated style option unions ──────────────────────────────────────

export type IllustratedHairStyle =
    | "bald"
    | "buzz"
    | "short"
    | "medium"
    | "long"
    | "curly"
    | "wavy"
    | "mohawk"
    | "afro"
    | "ponytail"
    | "bangs"
    | "sidepart";

export type IllustratedEyeStyle = "round" | "almond" | "narrow" | "wide" | "sleepy" | "winking" | "looking" | "glasses";

export type IllustratedEyebrowStyle = "natural" | "thick" | "thin" | "raised" | "furrowed" | "unibrow";

export type IllustratedNoseStyle = "small" | "pointed" | "round" | "long" | "button";

export type IllustratedMouthStyle = "smile" | "bigSmile" | "neutral" | "frown" | "open" | "smirk" | "tongue" | "teeth";

export interface IllustratedOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Override hair style */
    hairStyle?: IllustratedHairStyle;
    /** Override eye style */
    eyeStyle?: IllustratedEyeStyle;
    /** Override eyebrow style */
    eyebrowStyle?: IllustratedEyebrowStyle;
    /** Override nose style */
    noseStyle?: IllustratedNoseStyle;
    /** Override mouth style */
    mouthStyle?: IllustratedMouthStyle;
    /** Enable glasses (default: true, 20% chance) */
    glasses?: boolean;
    /** Enable hat (default: true, 10% chance) */
    hat?: boolean;
    /** Enable earrings (default: true, 8% chance) */
    earrings?: boolean;
    /** Enable facial hair (default: true, 15% chance) */
    facialHair?: boolean;
    /** Custom eye color palette */
    eyeColors?: string[];
}

// ─── Anime style option unions ────────────────────────────────────────────

export type AnimeHairStyle =
    | "short-spiky"
    | "medium-messy"
    | "long-straight"
    | "twin-tails"
    | "ponytail"
    | "side-swept"
    | "wild"
    | "bob"
    | "hime-cut"
    | "shaggy";

export type AnimeEyeStyle =
    "normal" | "sparkly" | "determined" | "gentle" | "cat" | "half-closed" | "closed-happy" | "surprised";

export type AnimeMouthStyle = "small-smile" | "open-small" | "cat-mouth" | "line" | "pout" | "grin";

export type AnimeNoseStyle = "dot" | "line" | "shadow";

export interface AnimeOptions extends AvatarOptions {
    /** Custom skin tone palette */
    skinTones?: string[];
    /** Custom eye color palette */
    eyeColors?: string[];
    /** Override hair style */
    hairStyle?: AnimeHairStyle;
    /** Override eye style */
    eyeStyle?: AnimeEyeStyle;
    /** Override mouth style */
    mouthStyle?: AnimeMouthStyle;
    /** Override nose style */
    noseStyle?: AnimeNoseStyle;
    /** Reserved for future expression overrides (currently no-op) */
    expression?: string;
    /** Enable bangs (default: random) */
    bangs?: boolean;
    /** Enable ahoge hair strand (default: random, 40% chance) */
    ahoge?: boolean;
    /** Enable blush (default: random, 35% chance) */
    blush?: boolean;
    /** Enable accessories (default: true) */
    accessories?: boolean;
}

// ─── Abstract style option unions ─────────────────────────────────────────

export type AbstractComposition = "mondrian" | "kandinsky" | "bauhaus";

export interface AbstractOptions extends AvatarOptions {
    /** Override the composition style */
    composition?: AbstractComposition;
    /** Number of accent shapes drawn on top of the base blocks (default: 3) */
    shapeCount?: number;
}

// ─── Emoji style option unions ────────────────────────────────────────────

export type EmojiExpression =
    "happy" | "laughing" | "cool" | "wink" | "love" | "sad" | "angry" | "surprised" | "sleepy" | "neutral";

export interface EmojiOptions extends AvatarOptions {
    /** Override the facial expression */
    expression?: EmojiExpression;
    /** Override the face fill color (default: yellow emoji palette) */
    faceColor?: string;
}

// ─── Animals style option unions ──────────────────────────────────────────

export type Animal = "cat" | "dog" | "bear" | "fox" | "panda" | "bunny" | "frog" | "monkey";

export interface AnimalsOptions extends AvatarOptions {
    /** Override which animal is rendered */
    animal?: Animal;
    /** Custom fur-tone palette (default: earth tones) */
    furTones?: string[];
}

// ─── Gradient style option unions ─────────────────────────────────────────

export type GradientDirection = "linear" | "radial" | "diagonal";
export type GradientPattern = "none" | "dots" | "stripes" | "waves" | "grid";

export interface GradientOptions extends AvatarOptions {
    /** Override gradient direction */
    direction?: GradientDirection;
    /** Override the pattern overlay */
    pattern?: GradientPattern;
    /** Number of color stops in the gradient (2 or 3, default 2) */
    colorStops?: number;
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
