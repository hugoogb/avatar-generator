/**
 * Seeded random number generator interface
 */
export interface Random {
  /** Returns a random float between 0 (inclusive) and 1 (exclusive) */
  next(): number;
  /** Returns a random integer between min (inclusive) and max (exclusive) */
  int(min: number, max: number): number;
  /** Returns a random item from an array */
  pick<T>(array: T[]): T;
  /** Returns a random boolean with optional probability (default 0.5) */
  bool(probability?: number): boolean;
  /** Shuffles an array in place and returns it */
  shuffle<T>(array: T[]): T[];
}

/**
 * Avatar result containing the generated SVG
 */
export interface AvatarResult {
  /** The generated SVG string */
  svg: string;
  /** Convert to data URI for use in img src */
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
  centerStyle?: "solid" | "dot" | "ring" | "diamond" | "none";
}

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
  mouthStyle?: string;
  /** Override eye style */
  eyeStyle?: string;
  /** Override hair style */
  hairStyle?: string;
}

export interface IllustratedOptions extends AvatarOptions {
  /** Custom skin tone palette */
  skinTones?: string[];
  /** Override hair style */
  hairStyle?: string;
  /** Override eye style */
  eyeStyle?: string;
  /** Override eyebrow style */
  eyebrowStyle?: string;
  /** Override nose style */
  noseStyle?: string;
  /** Override mouth style */
  mouthStyle?: string;
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

/**
 * Style definition interface - each style implements this
 */
export interface Style<T extends AvatarOptions = AvatarOptions> {
  /** Unique style identifier */
  name: string;
  /** Generate an avatar with the given options */
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
