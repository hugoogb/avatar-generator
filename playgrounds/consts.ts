import type { AvatarOptions, GeometricOptions, InitialsOptions, PixelsOptions, RingsOptions } from "@avatar-core/src";

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

// Geometric style options
export const GEOMETRIC_OPTIONS: GeometricOptions[] = [
    { seed: "geo-1", size: 64 },
    { seed: "geo-2", size: 80, gridSize: 5 },
    { seed: "geo-3", size: 64, square: true },
    { seed: "geo-4", size: 100, colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
    { seed: "geo-5", size: 64, border: { width: 2, color: "#333" } },
];

// Pixels style options
export const PIXELS_OPTIONS: PixelsOptions[] = [
    { seed: "pixel-1", size: 64 },
    { seed: "pixel-2", size: 80, pixelSize: 10 },
    { seed: "pixel-3", size: 64, mirror: false },
    { seed: "pixel-4", size: 100, square: true },
    { seed: "pixel-5", size: 64, colors: ["#DDA0DD", "#BB8FCE", "#98D8C8"] },
];

// Rings style options
export const RINGS_OPTIONS: RingsOptions[] = [
    { seed: "ring-1", size: 64 },
    { seed: "ring-2", size: 80, ringCount: 5 },
    { seed: "ring-3", size: 64, ringGap: 4 },
    { seed: "ring-4", size: 100, square: true },
    { seed: "ring-5", size: 64, colors: ["#85C1E9", "#45B7D1", "#96CEB4", "#4ECDC4"] },
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
