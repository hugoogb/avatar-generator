import type { AvatarOptions, GeometricOptions, InitialsOptions, PixelsOptions, RingsOptions, FacesOptions, IllustratedOptions, AnimeOptions } from "@avatar-core/src";

// Test seeds for avatar generation
export const TEST_SEEDS = [
    "John Doe",
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
    { seed: "John Doe", size: 80 },
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
    { seed: "face-2", size: 64, hairStyle: "curly" },
    { seed: "face-3", size: 80, eyeStyle: "happy", mouthStyle: "smile" },
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

// Legacy v1 options (for backwards compatibility testing)
export const LEGACY_OPTIONS = [
    {
        name: "John Doe",
        backgroundColor: "#4CAF50",
        shape: "circle" as const,
        textColor: "#000",
        fontSize: "30px",
        width: "120px",
        height: "120px",
        tooltip: true,
    },
    {
        name: "Jane Smith",
        backgroundColor: ["#2196F3", "#21CBF3"],
        textColor: "#fff",
        fontSize: "40px",
        width: "100px",
        height: "100px",
    },
];
