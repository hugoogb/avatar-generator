import type { AvatarOptions, ComposableStyle, Random } from "@avatar-generator/core";
import {
    createRandom,
    DEFAULT_COLORS,
    defineStyle,
    escapeXml,
    readableColor,
    resolveTheme,
    validateOption,
} from "@avatar-generator/core";

// ============================================================================
// Options
// ============================================================================

/** The symbols a mark is drawn from. */
export type MarksSymbol =
    "bars" | "arc" | "chevron" | "circles" | "quarters" | "diamond" | "spark" | "peak" | "cube" | "wave";

/** All valid symbol values for the marks style */
export const SYMBOLS: MarksSymbol[] = [
    "bars",
    "arc",
    "chevron",
    "circles",
    "quarters",
    "diamond",
    "spark",
    "peak",
    "cube",
    "wave",
];

/**
 * Options for the marks style.
 */
export interface MarksOptions extends AvatarOptions {
    /** Pin one symbol (otherwise chosen from the seed) */
    symbol?: MarksSymbol;
    /**
     * Draw the seed's first letter on a badge instead of a symbol (default: false).
     * A seed with no letter or digit in it, such as a lone emoji, keeps its symbol.
     */
    letter?: boolean;
}

// ============================================================================
// Geometry
// ============================================================================

const CANVAS = 64;
const C = CANVAS / 2;

/** Opacity of the second tone: a lighter shade of the ink on any background. */
const SECOND_TONE = 0.5;

/** The symbols are drawn about 30 units wide, then set a touch larger. */
const SCALE = 1.08;

/** Rounded so float noise cannot make the same mark differ across engines. */
const n = (value: number): number => Math.round(value * 100) / 100;

/** A point at `radius` from the centre, `degrees` clockwise from 3 o'clock. */
function polar(radius: number, degrees: number, cx = C, cy = C): [number, number] {
    const angle = (degrees * Math.PI) / 180;
    return [n(cx + radius * Math.cos(angle)), n(cy + radius * Math.sin(angle))];
}

/** A circle as a path, so several can share one even-odd fill. */
function circlePath(cx: number, cy: number, r: number): string {
    return `M ${n(cx - r)} ${n(cy)} a ${r} ${r} 0 1 0 ${n(2 * r)} 0 a ${r} ${r} 0 1 0 ${n(-2 * r)} 0 Z`;
}

/** An open arc from `from` to `to` degrees, clockwise. */
function arcPath(r: number, from: number, to: number): string {
    const [x1, y1] = polar(r, from);
    const [x2, y2] = polar(r, to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/** Fill attributes for the ink, or for its second tone. */
const paint = (ink: string, second = false): string =>
    second ? `fill="${ink}" fill-opacity="${SECOND_TONE}"` : `fill="${ink}"`;

/** Stroke attributes for a bold rounded line. */
const line = (ink: string, width: number, second = false): string =>
    `fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"` +
    (second ? ` stroke-opacity="${SECOND_TONE}"` : "");

/** A polygon with softened corners: filled and outlined in the same colour. */
function soft(points: Array<[number, number]>, ink: string, round: number, second = false): string {
    const d = `M ${points.map(([x, y]) => `${n(x)} ${n(y)}`).join(" L ")} Z`;
    const opacity = second ? ` opacity="${SECOND_TONE}"` : "";
    return `<path d="${d}" fill="${ink}" stroke="${ink}" stroke-width="${round}" stroke-linejoin="round"${opacity}/>`;
}

// ============================================================================
// Symbols. Each fits a box about 30 units wide around the centre, so the mark
// keeps a wide margin inside the circle and still reads at 24px.
// ============================================================================

type Draw = (ink: string) => string;

const BAR = 7;
const BAR_GAP = 4.5;

function bars(widths: number[], align: "left" | "centre", offsets: number[], second: number): Draw {
    const total = widths.length * BAR + (widths.length - 1) * BAR_GAP;
    const top = C - total / 2;
    const widest = Math.max(...widths);
    return (ink) =>
        widths
            .map((width, i) => {
                const x = (align === "left" ? C - widest / 2 : C - width / 2) + (offsets[i] ?? 0);
                const y = top + i * (BAR + BAR_GAP);
                return `<rect x="${n(x)}" y="${n(y)}" width="${width}" height="${BAR}" rx="${BAR / 2}" ${paint(ink, i === second)}/>`;
            })
            .join("");
}

/**
 * One drawing of a symbol, and the turns it may take. A turn is only allowed
 * where it cannot make the mark read as a face or a figure.
 */
interface Variant {
    draw: Draw;
    turns: number[];
}

const UPRIGHT = [0];

const SYMBOL_VARIANTS: Record<MarksSymbol, Variant[]> = {
    bars: [
        // A descending stack, or a rising chart when turned.
        { draw: bars([30, 22, 14], "left", [], -1), turns: [0, 270] },
        { draw: bars([12, 22, 32], "centre", [], -1), turns: [0, 270] },
        // Staggered, with a lighter middle.
        { draw: bars([24, 24, 24], "centre", [-4, 4, -4], 1), turns: [0, 270] },
    ],
    arc: [
        // An open ring around a dot.
        {
            draw: (ink) =>
                `<path d="${arcPath(12.5, 40, 320)}" ${line(ink, 7)}/><circle cx="${C}" cy="${C}" r="4.5" ${paint(ink)}/>`,
            turns: [0, 90, 180, 270],
        },
        // A dot orbiting in the ring's gap.
        {
            draw: (ink) => {
                const [x, y] = polar(12.5, 0);
                return `<path d="${arcPath(12.5, 55, 305)}" ${line(ink, 7)}/><circle cx="${x}" cy="${y}" r="4.5" ${paint(ink)}/>`;
            },
            turns: [0, 180, 315],
        },
    ],
    chevron: [
        { draw: (ink) => `<path d="M 18 39 L 32 25 L 46 39" ${line(ink, 8)}/>`, turns: [0, 90] },
        {
            draw: (ink) =>
                `<path d="M 20 31 L 32 19 L 44 31" ${line(ink, 7)}/>` +
                `<path d="M 20 45 L 32 33 L 44 45" ${line(ink, 7, true)}/>`,
            turns: [0, 90],
        },
    ],
    circles: [
        // Two discs whose overlap is cut out.
        {
            draw: (ink) =>
                `<path d="${circlePath(C - 6.5, C, 11)} ${circlePath(C + 6.5, C, 11)}" fill-rule="evenodd" ${paint(ink)}/>`,
            turns: [0, 90, 45],
        },
        // One in front of a lighter one.
        {
            draw: (ink) =>
                `<circle cx="${C + 6.5}" cy="${C}" r="11" ${paint(ink, true)}/><circle cx="${C - 6.5}" cy="${C}" r="11" ${paint(ink)}/>`,
            turns: [0, 180],
        },
    ],
    quarters: [
        // Right angles outward: a four-pointed flower.
        { draw: quarters([0, 1, 2, 3], -1), turns: UPRIGHT },
        { draw: quarters([1, 2, 3, 0], -1), turns: [0, 90] },
        // A disc in quarters, alternately lighter.
        { draw: quarters([2, 3, 0, 1], 1), turns: [0, 90] },
    ],
    diamond: [
        // A frame around a small diamond.
        {
            draw: (ink) =>
                `<path d="M 32 15 L 49 32 L 32 49 L 15 32 Z M 32 25 L 39 32 L 32 39 L 25 32 Z" fill-rule="evenodd" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" ${paint(ink)}/>`,
            turns: UPRIGHT,
        },
        // Two halves in two tones.
        {
            draw: (ink) =>
                soft(
                    [
                        [32, 16],
                        [32, 48],
                        [16, 32],
                    ],
                    ink,
                    3,
                ) +
                soft(
                    [
                        [33.5, 16],
                        [48, 32],
                        [33.5, 48],
                    ],
                    ink,
                    3,
                    true,
                ),
            turns: UPRIGHT,
        },
        // Layers: a flat diamond over two chevrons.
        {
            draw: (ink) =>
                soft(
                    [
                        [32, 16],
                        [47, 25],
                        [32, 34],
                        [17, 25],
                    ],
                    ink,
                    3,
                ) +
                `<path d="M 17 33 L 32 42 L 47 33" ${line(ink, 5, true)}/>` +
                `<path d="M 17 41 L 32 50 L 47 41" ${line(ink, 5)}/>`,
            turns: UPRIGHT,
        },
    ],
    spark: [
        { draw: (ink) => `<path d="${star(C, C, 17, 3)}" ${paint(ink)}/>`, turns: UPRIGHT },
        // A big spark and a small one.
        {
            draw: (ink) =>
                `<path d="${star(C - 3, C + 3, 14, 2.5)}" ${paint(ink)}/><path d="${star(C + 10, C - 10, 6.5, 1.2)}" ${paint(ink, true)}/>`,
            turns: [0, 270],
        },
        // A spark inside a lighter ring, clear of it all round.
        {
            draw: (ink) =>
                `<circle cx="${C}" cy="${C}" r="15.5" ${line(ink, 4, true)}/><path d="${star(C, C, 11, 1.8)}" ${paint(ink)}/>`,
            turns: UPRIGHT,
        },
    ],
    peak: [
        // Two mountains.
        {
            draw: (ink) =>
                soft(
                    [
                        [27, 19],
                        [41, 44],
                        [13, 44],
                    ],
                    ink,
                    3,
                    true,
                ) +
                soft(
                    [
                        [40, 27],
                        [51, 44],
                        [29, 44],
                    ],
                    ink,
                    3,
                ),
            turns: UPRIGHT,
        },
        // A peak under a sun.
        {
            draw: (ink) =>
                soft(
                    [
                        [29, 23],
                        [45, 46],
                        [13, 46],
                    ],
                    ink,
                    3,
                ) + `<circle cx="43" cy="21" r="5" ${paint(ink, true)}/>`,
            turns: UPRIGHT,
        },
        // A hollow triangle.
        {
            draw: (ink) =>
                `<path d="M 32 15 L 50 46 L 14 46 Z M 32 29 L 40 42 L 24 42 Z" fill-rule="evenodd" stroke="${ink}" stroke-width="3" stroke-linejoin="round" ${paint(ink)}/>`,
            turns: UPRIGHT,
        },
    ],
    cube: [
        { draw: cube([false, false, true]), turns: UPRIGHT },
        { draw: cube([true, false, false]), turns: UPRIGHT },
    ],
    wave: [
        { draw: waves([18, 32], 7, 1), turns: UPRIGHT },
        { draw: waves([14, 25, 36], 5.5, 1), turns: UPRIGHT },
    ],
};

/**
 * An isometric cube: top, left and right faces of a hexagon, each pulled in
 * from its neighbours so a sliver of background separates them. `second` says
 * which faces take the lighter tone.
 */
function cube(second: [boolean, boolean, boolean]): Draw {
    const r = 17;
    const corner = (degrees: number) => polar(r, degrees);
    const centre: [number, number] = [C, C];
    const faces: Array<Array<[number, number]>> = [
        [corner(-90), corner(-30), centre, corner(-150)],
        [corner(-150), centre, corner(90), corner(150)],
        [centre, corner(-30), corner(30), corner(90)],
    ];
    return (ink) =>
        faces
            .map((face, i) => {
                const mx = face.reduce((sum, [x]) => sum + x, 0) / face.length;
                const my = face.reduce((sum, [, y]) => sum + y, 0) / face.length;
                const inset = face.map(([x, y]): [number, number] => [mx + (x - mx) * 0.84, my + (y - my) * 0.84]);
                return soft(inset, ink, 2, second[i]);
            })
            .join("");
}

/** Stacked waves, one period wide; the line at `second` takes the lighter tone. */
function waves(ys: number[], width: number, second: number): Draw {
    const shift = C - (ys[0] + ys[ys.length - 1]) / 2;
    return (ink) =>
        ys
            .map((y0, i) => {
                const y = y0 + shift;
                return `<path d="M 17 ${n(y)} C 21 ${n(y - 7)} 27 ${n(y - 7)} 32 ${n(y)} S 43 ${n(y + 7)} 47 ${n(y)}" ${line(ink, width, i === second)}/>`;
            })
            .join("");
}

/**
 * Four quarter discs in a two-by-two grid. `corners` gives, for each cell
 * clockwise from the top left, which of its corners the disc's right angle
 * sits in, also clockwise from the top left.
 */
function quarters(corners: number[], second: number): Draw {
    const size = 14;
    const gap = 2.5;
    const start = C - size - gap / 2;
    const cells: Array<[number, number]> = [
        [start, start],
        [C + gap / 2, start],
        [C + gap / 2, C + gap / 2],
        [start, C + gap / 2],
    ];
    return (ink) =>
        cells
            .map(([x, y], i) => {
                const corner = corners[i];
                // The right-angle corner, then the two arc ends beside it.
                const cx = corner === 1 || corner === 2 ? x + size : x;
                const cy = corner === 2 || corner === 3 ? y + size : y;
                const dx = cx === x ? size : -size;
                const dy = cy === y ? size : -size;
                const sweep = dx * dy > 0 ? 1 : 0;
                return `<path d="M ${n(cx)} ${n(cy)} h ${dx} A ${size} ${size} 0 0 ${sweep} ${n(cx)} ${n(cy + dy)} Z" ${paint(ink, i === second || (second >= 0 && i === (second + 2) % 4))}/>`;
            })
            .join("");
}

/** A four-pointed star; `waist` sets how far its sides bow in. */
function star(cx: number, cy: number, r: number, waist: number): string {
    const p = [
        [cx, cy - r],
        [cx + r, cy],
        [cx, cy + r],
        [cx - r, cy],
    ];
    const q = [
        [cx + waist, cy - waist],
        [cx + waist, cy + waist],
        [cx - waist, cy + waist],
        [cx - waist, cy - waist],
    ];
    let d = `M ${n(p[0][0])} ${n(p[0][1])}`;
    for (let i = 0; i < 4; i++) {
        const next = p[(i + 1) % 4];
        d += ` Q ${n(q[i][0])} ${n(q[i][1])} ${n(next[0])} ${n(next[1])}`;
    }
    return `${d} Z`;
}

// ============================================================================
// Letter
// ============================================================================

// Unquoted on purpose: this value sits inside an attribute of a data URI.
const FONT_STACK = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

/**
 * The first letter or digit of a seed's first word, upper-cased. An email
 * address uses its local part, and leading emoji or punctuation are skipped,
 * so `🚀 Launch` gives `L`. Returns `undefined` when there is none.
 */
export function markLetter(seed: string): string | undefined {
    const text = seed.normalize("NFC").trim();
    const source = text.includes("@") ? text.split("@")[0] : text;
    const match = /[\p{L}\p{N}]/u.exec(source) ?? /[\p{L}\p{N}]/u.exec(text);
    if (!match) return undefined;
    // `ß` upper-cases to `SS`; one character is the point.
    return Array.from(match[0].toUpperCase())[0];
}

type BadgeShape = "circle" | "square";
const BADGES: BadgeShape[] = ["circle", "square"];

function drawLetter(letter: string, shape: BadgeShape, badge: string, text: string): string {
    const plate =
        shape === "circle"
            ? `<circle cx="${C}" cy="${C}" r="20.5" fill="${badge}"/>`
            : `<rect x="13" y="13" width="38" height="38" rx="11" fill="${badge}"/>`;
    return (
        plate +
        `<text x="${C}" y="${C}" font-family="${FONT_STACK}" font-size="26" font-weight="800" fill="${text}" text-anchor="middle" dominant-baseline="central">${escapeXml(letter)}</text>`
    );
}

// ============================================================================
// Style
// ============================================================================

/** What the seed decides for one marks avatar. */
export interface MarksTraits {
    /** The background the mark sits on. */
    background: string;
    /** The mark's colour. */
    ink: string;
    symbol: MarksSymbol;
    /** Which drawing of the symbol, and its turn in degrees. */
    variant: number;
    turn: number;
    /** The letter to draw instead, when `letter` is set and the seed has one. */
    letter?: string;
    badge: BadgeShape;
}

const pickBackground = (options: MarksOptions, random: Random): string => random.pick(options.colors ?? DEFAULT_COLORS);

function prepareMarks(options: MarksOptions, random: Random): MarksTraits {
    const background = pickBackground(options, createRandom(`${options.seed}:background`));
    // With no background, the page behind could be any colour. The palette's
    // mid-tones hold up on both light and dark, where black or white would vanish.
    const automatic = options.transparent ? background : readableColor(background);
    const picked = random.pick(SYMBOLS);
    const symbol = options.symbol ?? picked;
    const variants = SYMBOL_VARIANTS[symbol];
    const variant = random.int(0, variants.length);
    return {
        background,
        ink: resolveTheme(options.theme)?.foreground ?? automatic,
        symbol,
        variant,
        turn: random.pick(variants[variant].turns),
        letter: options.letter ? markLetter(options.seed) : undefined,
        badge: random.pick(BADGES),
    };
}

function drawMark(traits: MarksTraits, transparent: boolean | undefined): string {
    if (traits.letter) {
        // On a transparent avatar the badge carries the colour, and the letter
        // takes whichever of white or near-black reads on it.
        return transparent
            ? drawLetter(traits.letter, traits.badge, traits.ink, readableColor(traits.ink))
            : drawLetter(traits.letter, traits.badge, traits.ink, traits.background);
    }
    const variants = SYMBOL_VARIANTS[traits.symbol];
    const art = variants[traits.variant % variants.length].draw(traits.ink);
    const turn = traits.turn ? ` rotate(${traits.turn})` : "";
    return `<g transform="translate(${C} ${C}) scale(${SCALE})${turn} translate(${-C} ${-C})">${art}</g>`;
}

/**
 * Marks avatar style
 *
 * Creates logo-like badges for workspaces, teams and organisations: one bold,
 * centred symbol built from simple shapes, in white or near-black on a palette
 * colour, sometimes with a lighter second tone. Set `letter` to badge the
 * seed's first letter instead.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { marks } from '@avatar-generator/style-marks';
 *
 * const avatar = createAvatar(marks, { seed: 'Acme Inc', symbol: 'spark' });
 * const badge = createAvatar(marks, { seed: 'Acme Inc', letter: true });
 * ```
 */
export const marks: ComposableStyle<MarksOptions, MarksTraits> = defineStyle<MarksOptions, MarksTraits>({
    name: "marks",
    canvas: CANVAS,

    validate(options) {
        validateOption("marks", "symbol", options.symbol, SYMBOLS);
    },

    prepare: prepareMarks,

    background: pickBackground,

    layers: [{ name: "symbol", render: ({ traits, options }) => drawMark(traits, options.transparent) }],
});

export default marks;
