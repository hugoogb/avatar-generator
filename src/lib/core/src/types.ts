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
  /** Grid size (default: 4) */
  gridSize?: number;
}

export interface PixelsOptions extends AvatarOptions {
  /** Pixel grid size (default: 8) */
  pixelSize?: number;
  /** Mirror horizontally for symmetric look (default: true) */
  mirror?: boolean;
}

export interface RingsOptions extends AvatarOptions {
  /** Number of rings (default: 4) */
  ringCount?: number;
  /** Gap between rings (default: 2) */
  ringGap?: number;
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
