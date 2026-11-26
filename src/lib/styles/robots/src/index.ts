import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    createRandom,
    DEFAULT_COLORS,
    defineStyle,
    pickContrasting,
    readableColor,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

export type RobotsHeadShape = "box" | "rounded" | "dome" | "capsule";

export type RobotsAntenna = "none" | "ball" | "double" | "dish" | "bolt";

export type RobotsEyeStyle = "round" | "visor" | "cyclops" | "pixel" | "screen";

export type RobotsMouthStyle = "grille" | "slot" | "smile" | "none";

export interface RobotsOptions extends AvatarOptions {
    /** Override the head shape */
    headShape?: RobotsHeadShape;
    /** Override what sits on top of the head */
    antenna?: RobotsAntenna;
    /** Override the eye style */
    eyeStyle?: RobotsEyeStyle;
    /** Override the mouth style */
    mouthStyle?: RobotsMouthStyle;
    /**
     * Custom palette for the robot's body. The pick stays apart from the
     * background where the palette allows it.
     */
    metalColors?: string[];
}

/** All valid head shape values for the robots style */
export const HEAD_SHAPES: RobotsHeadShape[] = ["box", "rounded", "dome", "capsule"];

/** All valid antenna values for the robots style */
export const ANTENNAS: RobotsAntenna[] = ["none", "ball", "double", "dish", "bolt"];

/** All valid eye style values for the robots style */
export const EYE_STYLES: RobotsEyeStyle[] = ["round", "visor", "cyclops", "pixel", "screen"];

/** All valid mouth style values for the robots style */
export const MOUTH_STYLES: RobotsMouthStyle[] = ["grille", "slot", "smile", "none"];

/** Body colours used when the caller does not supply `metalColors`. */
export const METAL_COLORS = [
    "#E4E9F0", // Silver
    "#B8C2CF", // Steel
    "#F2E6CC", // Cream
    "#C6E9DA", // Mint
    "#CFDAF7", // Periwinkle
    "#F6CDB8", // Peach
    "#454F60", // Gunmetal
    "#2E3A55", // Navy
    "#B4643E", // Copper
];

// Lights shine from a dark housing, so they read on any metal. None are red:
// a robot glaring red reads as a threat.
const GLOWS = ["#67E8F9", "#6EE7B7", "#FDE68A", "#A5B4FC", "#BEF264", "#F9A8D4"];

const DARK = "#1C2430";
const LIGHT = "#F8FAFC";
const BLUSH = "#F9A8D4";

// Everything is drawn on this canvas and scaled by the SVG, so plain numbers stay
// in proportion at any size.
const CANVAS = 64;
const CX = 32;
const WIDTH = 36;
const HEIGHT = 28;
const LEFT = CX - WIDTH / 2;
const RIGHT = CX + WIDTH / 2;
const TOP = 17;
const BOTTOM = TOP + HEIGHT;
const EYE_Y = TOP + 12;
const EYE_SPACING = 8;

type EarStyle = "bolt" | "dial" | "none";
type PanelStyle = "lights" | "heart" | "dial";

/** Mixes two hex colours, `amount` of the way from `from` to `to`. */
function mix(from: string, to: string, amount: number): string {
    const parse = (hex: string) => {
        const match = /^#([0-9a-f]{6})$/i.exec(hex);
        if (!match) return undefined;
        return [0, 2, 4].map((start) => parseInt(match[1].slice(start, start + 2), 16));
    };
    const a = parse(from);
    const b = parse(to);
    if (!a || !b) return from;
    return `#${a
        .map((channel, i) => Math.round(channel + (b[i] - channel) * amount))
        .map((channel) => channel.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`;
}

/** The background `defineStyle` would pick, so the metal can be kept apart from it. */
function pickBackground(options: AvatarOptions, random: Random): string {
    return random.pick(options.colors ?? DEFAULT_COLORS);
}

// ─── Drawing ──────────────────────────────────────────────────────────────

function drawHead(shape: RobotsHeadShape, metal: string, shade: string): string {
    const glint = `fill="#FFFFFF" fill-opacity="0.45"`;
    switch (shape) {
        case "box":
            return (
                `<rect x="${LEFT}" y="${TOP}" width="${WIDTH}" height="${HEIGHT}" rx="3" fill="${metal}"/>` +
                `<rect x="${LEFT + 4}" y="${TOP + 2.5}" width="9" height="2.4" rx="1.2" ${glint}/>` +
                [
                    [LEFT + 3.2, BOTTOM - 3.2],
                    [RIGHT - 3.2, BOTTOM - 3.2],
                    [RIGHT - 3.2, TOP + 3.2],
                ]
                    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${shade}"/>`)
                    .join("")
            );
        case "rounded":
            return (
                `<rect x="${LEFT + 1}" y="${TOP - 1}" width="${WIDTH - 2}" height="${HEIGHT + 2}" rx="10" fill="${metal}"/>` +
                `<rect x="${LEFT + 6}" y="${TOP + 2}" width="8" height="2.4" rx="1.2" ${glint}/>`
            );
        case "dome":
            return (
                `<path d="M ${LEFT + 1} ${TOP + 15} C ${LEFT + 1} ${TOP - 5.5} ${RIGHT - 1} ${TOP - 5.5} ${RIGHT - 1} ${TOP + 15} ` +
                `V ${BOTTOM - 4} Q ${RIGHT - 1} ${BOTTOM} ${RIGHT - 5} ${BOTTOM} H ${LEFT + 5} Q ${LEFT + 1} ${BOTTOM} ${LEFT + 1} ${BOTTOM - 4} Z" fill="${metal}"/>` +
                `<rect x="${LEFT + 1}" y="${TOP + 13}" width="${WIDTH - 2}" height="2.2" fill="${shade}" fill-opacity="0.55"/>` +
                `<path d="M ${LEFT + 7} ${TOP + 6} Q ${LEFT + 9} ${TOP + 1.5} ${LEFT + 14} ${TOP + 0.5}" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2.4" stroke-linecap="round"/>`
            );
        case "capsule":
            return (
                `<rect x="${LEFT - 2}" y="${TOP + 1}" width="${WIDTH + 4}" height="${HEIGHT - 2}" rx="${(HEIGHT - 2) / 2}" fill="${metal}"/>` +
                `<rect x="${LEFT + 6}" y="${TOP + 3.5}" width="8" height="2.4" rx="1.2" ${glint}/>`
            );
    }
}

function drawAntenna(style: RobotsAntenna, metal: string, shade: string, glow: string): string {
    const stem = `stroke="${shade}" stroke-width="2.6" stroke-linecap="round"`;
    switch (style) {
        case "none":
            return "";
        case "ball":
            return (
                `<line x1="${CX}" y1="${TOP + 2}" x2="${CX}" y2="${TOP - 8}" ${stem}/>` +
                `<circle cx="${CX}" cy="${TOP - 9.5}" r="3.8" fill="${glow}"/>` +
                `<circle cx="${CX - 1.2}" cy="${TOP - 10.7}" r="1.1" fill="#FFFFFF" fill-opacity="0.7"/>`
            );
        case "double":
            return (
                `<line x1="${CX - 6}" y1="${TOP + 2}" x2="${CX - 10}" y2="${TOP - 8}" ${stem}/>` +
                `<line x1="${CX + 6}" y1="${TOP + 2}" x2="${CX + 10}" y2="${TOP - 8}" ${stem}/>` +
                `<circle cx="${CX - 10}" cy="${TOP - 9}" r="3" fill="${glow}"/>` +
                `<circle cx="${CX + 10}" cy="${TOP - 9}" r="3" fill="${glow}"/>`
            );
        case "dish": {
            // A bowl tilted to one side, with its feed horn pointing up out of it.
            const y = TOP - 8;
            return (
                `<line x1="${CX}" y1="${TOP + 2}" x2="${CX}" y2="${y + 3}" ${stem}/>` +
                `<g transform="rotate(-22 ${CX} ${y})">` +
                `<path d="M ${CX - 8.5} ${y} A 8.5 6 0 0 0 ${CX + 8.5} ${y} Z" fill="${metal}" stroke="${shade}" stroke-width="2" stroke-linejoin="round"/>` +
                `<line x1="${CX}" y1="${y}" x2="${CX}" y2="${y - 4.5}" ${stem}/>` +
                `<circle cx="${CX}" cy="${y - 5}" r="2.2" fill="${glow}"/>` +
                `</g>`
            );
        }
        case "bolt": {
            const y = TOP - 15.5;
            return (
                `<line x1="${CX}" y1="${TOP + 2}" x2="${CX}" y2="${TOP - 4}" ${stem}/>` +
                `<path d="M ${CX + 2.5} ${y} L ${CX - 5} ${y + 8} H ${CX - 0.5} L ${CX - 2.5} ${y + 13.5} L ${CX + 5} ${y + 5.5} H ${CX + 0.5} L ${CX + 2.5} ${y} Z" fill="${glow}" stroke="${shade}" stroke-width="1.2" stroke-linejoin="round"/>`
            );
        }
    }
}

function drawEars(style: EarStyle, shade: string, glow: string): string {
    const side = (x: number, flip: number) => {
        switch (style) {
            case "none":
                return "";
            case "bolt":
                return (
                    `<rect x="${x - 3}" y="${EYE_Y - 5}" width="6" height="11" rx="2" fill="${shade}"/>` +
                    `<rect x="${x - 3 + flip * 2.6}" y="${EYE_Y - 2.5}" width="3.4" height="6" rx="1.2" fill="${shade}"/>`
                );
            case "dial":
                return (
                    `<circle cx="${x}" cy="${EYE_Y + 1}" r="5" fill="${shade}"/>` +
                    `<circle cx="${x}" cy="${EYE_Y + 1}" r="2.3" fill="${glow}"/>`
                );
        }
    };
    return side(LEFT - 1, -1) + side(RIGHT + 1, 1);
}

/** The dark glass the screen and visor eyes shine through. */
function drawEyePlate(style: RobotsEyeStyle): string {
    switch (style) {
        case "screen":
            return `<rect x="${LEFT + 3}" y="${TOP + 3.5}" width="${WIDTH - 6}" height="${HEIGHT - 6}" rx="5" fill="${DARK}"/>`;
        case "visor":
            return `<rect x="${LEFT + 2.5}" y="${EYE_Y - 5.5}" width="${WIDTH - 5}" height="11" rx="5.5" fill="${DARK}"/>`;
        default:
            return "";
    }
}

function drawEyes(style: RobotsEyeStyle, glow: string): string {
    const pair = (draw: (x: number) => string) => draw(CX - EYE_SPACING) + draw(CX + EYE_SPACING);
    switch (style) {
        case "round":
            return pair(
                (x) =>
                    `<circle cx="${x}" cy="${EYE_Y}" r="5.8" fill="${DARK}"/>` +
                    `<circle cx="${x}" cy="${EYE_Y}" r="4" fill="${glow}"/>` +
                    `<circle cx="${x}" cy="${EYE_Y}" r="1.8" fill="${DARK}"/>` +
                    `<circle cx="${x - 1.7}" cy="${EYE_Y - 1.7}" r="1.1" fill="#FFFFFF"/>`,
            );
        case "cyclops":
            return (
                `<circle cx="${CX}" cy="${EYE_Y - 0.5}" r="8.5" fill="${DARK}"/>` +
                `<circle cx="${CX}" cy="${EYE_Y - 0.5}" r="6" fill="${glow}"/>` +
                `<circle cx="${CX}" cy="${EYE_Y - 0.5}" r="2.8" fill="${DARK}"/>` +
                `<circle cx="${CX - 2.4}" cy="${EYE_Y - 2.9}" r="1.6" fill="#FFFFFF"/>`
            );
        case "pixel": {
            const cell = 2.6;
            const gap = 0.6;
            return pair((x) => {
                const start = x - (cell * 3 + gap * 2) / 2;
                let cells = `<rect x="${x - 5.6}" y="${EYE_Y - 5.6}" width="11.2" height="11.2" rx="2" fill="${DARK}"/>`;
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const corner = row !== 1 && col !== 1;
                        cells +=
                            `<rect x="${Math.round((start + col * (cell + gap)) * 100) / 100}" y="${Math.round((EYE_Y - 4.2 + row * (cell + gap)) * 100) / 100}" ` +
                            `width="${cell}" height="${cell}" fill="${glow}"${corner ? ` fill-opacity="0.4"` : ""}/>`;
                    }
                }
                return cells;
            });
        }
        case "screen":
            return pair(
                (x) => `<rect x="${x - 2.2}" y="${EYE_Y - 4}" width="4.4" height="8" rx="2.2" fill="${glow}"/>`,
            );
        case "visor":
            return pair((x) => `<rect x="${x - 4.5}" y="${EYE_Y - 2}" width="9" height="4" rx="2" fill="${glow}"/>`);
    }
}

function drawMouth(style: RobotsMouthStyle, traits: RobotsTraits): string {
    const onScreen = traits.eyeStyle === "screen";
    const y = traits.eyeStyle === "cyclops" ? EYE_Y + 11 : EYE_Y + 9;
    const ink = onScreen ? traits.glow : traits.ink;
    switch (style) {
        case "none":
            return "";
        case "grille": {
            const bars = [-4.5, -1.5, 1.5, 4.5]
                .map(
                    (dx) =>
                        `<rect x="${CX + dx - 1}" y="${y - 2}" width="2" height="4" rx="1" fill="${onScreen ? traits.glow : traits.metal}"/>`,
                )
                .join("");
            return onScreen
                ? bars
                : `<rect x="${CX - 8}" y="${y - 3}" width="16" height="6" rx="2.5" fill="${DARK}"/>` + bars;
        }
        case "slot":
            return `<rect x="${CX - 6}" y="${y - 1.4}" width="12" height="2.8" rx="1.4" fill="${ink}"/>`;
        case "smile":
            return `<path d="M ${CX - 5.5} ${y - 1.5} Q ${CX} ${y + 4} ${CX + 5.5} ${y - 1.5}" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
}

function drawPanel(style: PanelStyle, traits: RobotsTraits): string {
    switch (style) {
        case "lights":
            return (
                `<rect x="${CX - 8}" y="54.5" width="16" height="7" rx="2" fill="${DARK}"/>` +
                [traits.glow, "#FDE68A", "#86EFAC"]
                    .map((color, i) => `<circle cx="${CX - 4.2 + i * 4.2}" cy="58" r="1.5" fill="${color}"/>`)
                    .join("")
            );
        case "heart":
            return `<path d="M ${CX} 62 C ${CX - 7} 57.5 ${CX - 6} 52.5 ${CX - 2.8} 53 C ${CX - 1.4} 53.2 ${CX} 54.5 ${CX} 55.3 C ${CX} 54.5 ${CX + 1.4} 53.2 ${CX + 2.8} 53 C ${CX + 6} 52.5 ${CX + 7} 57.5 ${CX} 62 Z" fill="${BLUSH}"/>`;
        case "dial":
            return (
                `<circle cx="${CX}" cy="58" r="4.6" fill="${DARK}"/>` +
                `<line x1="${CX}" y1="58" x2="${CX + 2.2}" y2="55.7" stroke="${traits.glow}" stroke-width="2" stroke-linecap="round"/>`
            );
    }
}

// ─── Traits ───────────────────────────────────────────────────────────────

/** What the seed decides for one robots avatar. */
export interface RobotsTraits {
    metal: string;
    shade: string;
    ink: string;
    glow: string;
    headShape: RobotsHeadShape;
    antenna: RobotsAntenna;
    eyeStyle: RobotsEyeStyle;
    mouthStyle: RobotsMouthStyle;
    earStyle: EarStyle;
    panelStyle: PanelStyle;
    showBlush: boolean;
}

// A blank face is fine on request, but rarely the seed's own pick.
const PICKED_MOUTHS: RobotsMouthStyle[] = ["grille", "grille", "slot", "slot", "smile", "smile", "smile", "none"];

function prepareRobots(options: RobotsOptions, random: Random): RobotsTraits {
    const background = pickBackground(options, createRandom(`${options.seed}:background`));
    const metal = pickContrasting(random, options.metalColors ?? METAL_COLORS, background, 1.6);
    const ink = readableColor(metal, LIGHT, DARK);
    // Darker on light metal, lighter on dark, so seams and stems always show.
    const shade = ink === DARK ? mix(metal, DARK, 0.38) : mix(metal, LIGHT, 0.28);

    // Every pick is drawn even when an option overrides it, so that pinning one
    // trait leaves the seed's other choices where they were.
    const glow = random.pick(GLOWS);
    const headShape = random.pick(HEAD_SHAPES);
    const antenna = random.pick(ANTENNAS);
    const eyeStyle = random.pick(EYE_STYLES);
    const mouthStyle = random.pick(PICKED_MOUTHS);

    return {
        metal,
        shade,
        ink,
        glow,
        headShape: options.headShape ?? headShape,
        antenna: options.antenna ?? antenna,
        eyeStyle: options.eyeStyle ?? eyeStyle,
        mouthStyle: options.mouthStyle ?? mouthStyle,
        earStyle: random.pick<EarStyle>(["bolt", "bolt", "dial", "none"]),
        panelStyle: random.pick<PanelStyle>(["lights", "heart", "dial"]),
        showBlush: random.bool(0.3),
    };
}

/**
 * Robots avatar style
 *
 * Friendly robot heads on shoulders for bots, AI agents, service accounts and
 * API keys: four head shapes, five antennas, five kinds of glowing eyes and
 * four mouths, in a metal colour kept apart from the background.
 *
 * Its features can be mixed with other styles: `body`, `panel`, `antenna`,
 * `ears`, `head`, `eyes`, `mouth` and `blush`.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { robots } from '@avatar-generator/style-robots';
 *
 * const avatar = createAvatar(robots, {
 *   seed: 'deploy-bot',
 *   size: 64,
 * });
 * ```
 */
export const robots: ComposableStyle<RobotsOptions, RobotsTraits> = defineStyle<RobotsOptions, RobotsTraits>({
    name: "robots",
    canvas: CANVAS,

    validate(options) {
        validateOption("robots", "headShape", options.headShape, HEAD_SHAPES);
        validateOption("robots", "antenna", options.antenna, ANTENNAS);
        validateOption("robots", "eyeStyle", options.eyeStyle, EYE_STYLES);
        validateOption("robots", "mouthStyle", options.mouthStyle, MOUTH_STYLES);
        if (options.metalColors !== undefined && options.metalColors.length === 0) {
            throw new Error("[@avatar-generator/style-robots] Invalid metalColors: expected at least one colour.");
        }
    },

    prepare: prepareRobots,

    background: pickBackground,

    head: () => ({ x: LEFT, y: TOP, width: WIDTH, height: HEIGHT }),

    layers: [
        {
            name: "body",
            render: ({ traits }) =>
                `<rect x="${CX - 6}" y="${BOTTOM - 2}" width="12" height="9" rx="1.5" fill="${traits.shade}"/>` +
                `<path d="M 10 64 V 58 Q 10 51 17 51 H 47 Q 54 51 54 58 V 64 Z" fill="${traits.metal}"/>`,
        },
        { name: "panel", render: ({ traits }) => drawPanel(traits.panelStyle, traits) },
        {
            name: "antenna",
            render: ({ traits }) => drawAntenna(traits.antenna, traits.metal, traits.shade, traits.glow),
        },
        { name: "ears", render: ({ traits }) => drawEars(traits.earStyle, traits.shade, traits.glow) },
        { name: "head", render: ({ traits }) => drawHead(traits.headShape, traits.metal, traits.shade) },
        {
            // Out of the eyes layer, so that a blink closes the lights and not the
            // glass. Part of the head, so that eyes taken into a mix never land
            // underneath it.
            name: "faceplate",
            feature: "head",
            render: ({ traits }) => drawEyePlate(traits.eyeStyle),
        },
        { name: "eyes", render: ({ traits }) => drawEyes(traits.eyeStyle, traits.glow) },
        { name: "mouth", render: ({ traits }) => drawMouth(traits.mouthStyle, traits) },
        {
            name: "blush",
            render: ({ traits }) =>
                traits.showBlush && traits.eyeStyle !== "cyclops"
                    ? `<rect x="${LEFT + 3}" y="${EYE_Y + 6}" width="5" height="2.6" rx="1.3" fill="${BLUSH}" fill-opacity="0.75"/>` +
                      `<rect x="${RIGHT - 8}" y="${EYE_Y + 6}" width="5" height="2.6" rx="1.3" fill="${BLUSH}" fill-opacity="0.75"/>`
                    : "",
        },
    ],
});

export default robots;
