import { describe, expect, it } from "vitest";
import type { AvatarOptions, Style } from "@avatar-generator/core";
import { createAvatar } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { pixels } from "@avatar-generator/style-pixels";
import { rings } from "@avatar-generator/style-rings";
import { faces } from "@avatar-generator/style-faces";
import { illustrated } from "@avatar-generator/style-illustrated";
import { anime } from "@avatar-generator/style-anime";

const styles: Array<[string, Style<AvatarOptions>]> = [
    ["initials", initials as Style<AvatarOptions>],
    ["geometric", geometric as Style<AvatarOptions>],
    ["pixels", pixels as Style<AvatarOptions>],
    ["rings", rings as Style<AvatarOptions>],
    ["faces", faces as Style<AvatarOptions>],
    ["illustrated", illustrated as Style<AvatarOptions>],
    ["anime", anime as Style<AvatarOptions>],
];

// Locked seeds and sizes so snapshots change only when a style's
// rendering logic changes, not when upstream defaults shift.
const SNAPSHOT_SEEDS = ["Hugo GB", "alice@example.com", "user-42"];

describe.each(styles)("%s snapshot", (name, style) => {
    for (const seed of SNAPSHOT_SEEDS) {
        it(`matches snapshot for seed "${seed}"`, async () => {
            const { svg } = createAvatar(style, { seed, size: 64 });
            await expect(svg).toMatchFileSnapshot(`./__snapshots__/${name}-${sanitize(seed)}.svg`);
        });
    }
});

function sanitize(seed: string): string {
    return seed.replace(/[^a-zA-Z0-9-]/g, "_");
}
