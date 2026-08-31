import type { AvatarOptions } from "@avatar-core/src";
// Each style owns its option type; core only declares the Style contract.
import type { AbstractOptions } from "@avatar-style-abstract/src";
import type { AnimalsOptions } from "@avatar-style-animals/src";
import type { AnimeOptions } from "@avatar-style-anime/src";
import type { EmojiOptions } from "@avatar-style-emoji/src";
import type { FacesOptions } from "@avatar-style-faces/src";
import type { GeometricOptions } from "@avatar-style-geometric/src";
import type { GradientOptions } from "@avatar-style-gradient/src";
import type { IllustratedOptions } from "@avatar-style-illustrated/src";
import type { InitialsOptions } from "@avatar-style-initials/src";
import type { PixelsOptions } from "@avatar-style-pixels/src";
import type { RingsOptions } from "@avatar-style-rings/src";

// Test seeds for avatar generation
export const TEST_SEEDS = [
    "Hugo GB",
    "Jane Smith",
    "Josh Stanley",
    "Chris Evans",
    "Peter Parker",
    "user-123",
    "alice@example.com",
    "bob@company.org",
];

// Base options for testing
export const BASE_OPTIONS: AvatarOptions = {
    seed: "test-seed",
    size: 64,
};

// Initials style options
export const INITIALS_OPTIONS: InitialsOptions[] = [
    { seed: "Hugo GB", size: 80 },
    { seed: "jane.smith@example.com", name: "Jane Smith", size: 64 },
    { seed: "user-123", name: "JS", size: 64, fontWeight: 700 },
    { seed: "Chris Evans", size: 100, square: true },
    { seed: "Peter", size: 64, textColor: "#000", colors: ["#FFEAA7", "#F7DC6F"] },
];

// Geometric style options (identicon)
export const GEOMETRIC_OPTIONS: GeometricOptions[] = [
    { seed: "geo-1", size: 64 },
    { seed: "geo-2", size: 80, gridSize: 5 },
    { seed: "geo-3", size: 64, square: true },
    { seed: "geo-4", size: 100, colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
    { seed: "geo-5", size: 64, border: { width: 2, color: "#333" } },
    { seed: "geo-6", size: 80, gridSize: 7 },
    { seed: "geo-7", size: 64, foregroundColor: "#2C3E50" },
];

// Pixels style options (pixel faces)
export const PIXELS_OPTIONS: PixelsOptions[] = [
    { seed: "pixel-1", size: 64 },
    { seed: "pixel-2", size: 80, pixelSize: 10 },
    { seed: "pixel-3", size: 64 },
    { seed: "pixel-4", size: 100, square: true },
    { seed: "pixel-5", size: 64, colors: ["#DDA0DD", "#BB8FCE", "#98D8C8"] },
    { seed: "pixel-6", size: 80, accessories: false },
    { seed: "pixel-7", size: 64, featureColor: "#1a1a2e" },
];

// Rings style options
export const RINGS_OPTIONS: RingsOptions[] = [
    { seed: "ring-1", size: 64 },
    { seed: "ring-2", size: 80, ringCount: 5 },
    { seed: "ring-3", size: 64, ringGap: 4 },
    { seed: "ring-4", size: 100, square: true },
    { seed: "ring-5", size: 64, colors: ["#85C1E9", "#45B7D1", "#96CEB4", "#4ECDC4"] },
    { seed: "ring-6", size: 80, centerStyle: "diamond" },
    { seed: "ring-7", size: 64, segmented: false, dashed: true },
];

// Faces style options
export const FACES_OPTIONS: FacesOptions[] = [
    { seed: "face-1", size: 80 },
    { seed: "face-2", size: 64, hairStyle: "side-swept" },
    { seed: "face-3", size: 80, eyeStyle: "round", mouthStyle: "rect-smile" },
    { seed: "face-4", size: 100, square: true },
    { seed: "face-5", size: 64, eyebrows: false, ears: false },
    { seed: "face-6", size: 80, featureColor: "#1a1a2e" },
    { seed: "face-7", size: 64, hairStyle: "mohawk" },
];

// Illustrated style options
export const ILLUSTRATED_OPTIONS: IllustratedOptions[] = [
    { seed: "illust-1", size: 80 },
    { seed: "illust-2", size: 80, hairStyle: "afro" },
    { seed: "illust-3", size: 80, eyeStyle: "winking", mouthStyle: "bigSmile" },
    { seed: "illust-4", size: 100, square: true },
    { seed: "illust-5", size: 80, glasses: true, hat: false },
    { seed: "illust-6", size: 80, facialHair: true },
    { seed: "illust-7", size: 80, hairStyle: "long", mouthStyle: "smile" },
];

// Anime style options
export const ANIME_OPTIONS: AnimeOptions[] = [
    { seed: "anime-1", size: 80 },
    { seed: "anime-2", size: 80, hairStyle: "twin-tails", eyeStyle: "sparkly" },
    { seed: "anime-3", size: 80, eyeStyle: "cat", mouthStyle: "cat-mouth" },
    { seed: "anime-4", size: 100, square: true },
    { seed: "anime-5", size: 80, blush: true, ahoge: true },
    { seed: "anime-6", size: 80, hairStyle: "wild", eyeStyle: "determined" },
    { seed: "anime-7", size: 80, hairStyle: "hime-cut", mouthStyle: "small-smile", bangs: true },
];

// Abstract style options
export const ABSTRACT_OPTIONS: AbstractOptions[] = [
    { seed: "abstract-1", size: 80 },
    { seed: "abstract-2", size: 80, composition: "mondrian" },
    { seed: "abstract-3", size: 80, composition: "kandinsky" },
    { seed: "abstract-4", size: 80, composition: "bauhaus" },
    { seed: "abstract-5", size: 100, square: true },
    { seed: "abstract-6", size: 80, composition: "kandinsky", shapeCount: 6 },
    { seed: "abstract-7", size: 80, border: { width: 2, color: "#000" } },
];

// Emoji style options
export const EMOJI_OPTIONS: EmojiOptions[] = [
    { seed: "emoji-1", size: 80 },
    { seed: "emoji-2", size: 80, expression: "laughing" },
    { seed: "emoji-3", size: 80, expression: "cool" },
    { seed: "emoji-4", size: 80, expression: "love" },
    { seed: "emoji-5", size: 100, expression: "sleepy" },
    { seed: "emoji-6", size: 80, expression: "surprised" },
    { seed: "emoji-7", size: 80, expression: "angry", faceColor: "#FFAD42" },
];

// Animals style options
export const ANIMALS_OPTIONS: AnimalsOptions[] = [
    { seed: "animals-1", size: 80 },
    { seed: "animals-2", size: 80, animal: "cat" },
    { seed: "animals-3", size: 80, animal: "dog" },
    { seed: "animals-4", size: 80, animal: "fox" },
    { seed: "animals-5", size: 80, animal: "panda" },
    { seed: "animals-6", size: 80, animal: "bunny" },
    { seed: "animals-7", size: 80, animal: "frog" },
];

// Gradient style options
export const GRADIENT_OPTIONS: GradientOptions[] = [
    { seed: "gradient-1", size: 80 },
    { seed: "gradient-2", size: 80, direction: "linear", pattern: "dots" },
    { seed: "gradient-3", size: 80, direction: "radial", pattern: "waves" },
    { seed: "gradient-4", size: 80, direction: "diagonal", pattern: "stripes" },
    { seed: "gradient-5", size: 100, square: true, pattern: "grid" },
    { seed: "gradient-6", size: 80, colorStops: 3 },
    { seed: "gradient-7", size: 80, colors: ["#FF6B9D", "#FFD600"], pattern: "none" },
];
