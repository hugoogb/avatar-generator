/**
 * Every package the release publishes, as directories under src/. The publish,
 * trust, verify and version-guard scripts and the smoke test all read this one
 * list, so a new package cannot be released by some of them and missed by others.
 */
export const PACKAGE_DIRS = [
    "lib/core",
    ...[
        "initials",
        "geometric",
        "pixels",
        "rings",
        "faces",
        "illustrated",
        "anime",
        "abstract",
        "emoji",
        "animals",
        "gradient",
        "robots",
        "portraits",
        "creatures",
        "marks",
    ].map((s) => `lib/styles/${s}`),
    ...["react", "react-native", "angular", "vue", "svelte", "web-component", "create-avatar-style"].map(
        (p) => `packages/${p}`,
    ),
];
