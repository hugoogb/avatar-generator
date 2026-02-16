import type { Style, IllustratedOptions, AvatarResult } from "@avatar-generator/core";
import type { Random } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, SKIN_TONES, EYE_COLORS, buildSvg } from "@avatar-generator/core";

// ============================================================================
// Feature variant types
// ============================================================================

type HairStyle = "bald" | "buzz" | "short" | "medium" | "long" | "curly" | "wavy" | "mohawk" | "afro" | "ponytail" | "bangs" | "sidepart";
type EyeStyle = "round" | "almond" | "narrow" | "wide" | "sleepy" | "winking" | "looking" | "glasses";
type EyebrowStyle = "natural" | "thick" | "thin" | "raised" | "furrowed" | "unibrow";
type NoseStyle = "small" | "pointed" | "round" | "long" | "button";
type MouthStyle = "smile" | "bigSmile" | "neutral" | "frown" | "open" | "smirk" | "tongue" | "teeth";
type GlassesType = "round" | "square" | "aviator";
type HatType = "beanie" | "cap" | "tophat";
type FacialHairType = "stubble" | "mustache" | "beard";

const HAIR_STYLES: HairStyle[] = ["bald", "buzz", "short", "medium", "long", "curly", "wavy", "mohawk", "afro", "ponytail", "bangs", "sidepart"];
const EYE_STYLES: EyeStyle[] = ["round", "almond", "narrow", "wide", "sleepy", "winking", "looking", "glasses"];
const EYEBROW_STYLES: EyebrowStyle[] = ["natural", "thick", "thin", "raised", "furrowed", "unibrow"];
const NOSE_STYLES: NoseStyle[] = ["small", "pointed", "round", "long", "button"];
const MOUTH_STYLES: MouthStyle[] = ["smile", "bigSmile", "neutral", "frown", "open", "smirk", "tongue", "teeth"];
const GLASSES_TYPES: GlassesType[] = ["round", "square", "aviator"];
const HAT_TYPES: HatType[] = ["beanie", "cap", "tophat"];
const FACIAL_HAIR_TYPES: FacialHairType[] = ["stubble", "mustache", "beard"];

// ============================================================================
// Geometry helper
// ============================================================================

interface Geo {
  size: number;
  cx: number;
  cy: number;
  headW: number;
  headH: number;
  eyeY: number;
  eyeSpacing: number;
  mouthY: number;
  noseY: number;
  browY: number;
}

function computeGeo(size: number): Geo {
  const cx = size / 2;
  const cy = size * 0.48;
  const headW = size * 0.6;
  const headH = size * 0.7;
  return {
    size,
    cx,
    cy,
    headW,
    headH,
    eyeY: cy - headH * 0.04,
    eyeSpacing: headW * 0.2,
    mouthY: cy + headH * 0.22,
    noseY: cy + headH * 0.08,
    browY: cy - headH * 0.12,
  };
}

// ============================================================================
// Hair rendering
// ============================================================================

function drawHairBehind(style: HairStyle, g: Geo, color: string): string {
  const { cx, cy, headW, headH } = g;
  const top = cy - headH / 2;
  const left = cx - headW / 2;
  const right = cx + headW / 2;

  switch (style) {
    case "bald":
    case "buzz":
      return "";
    case "short":
      return `<ellipse cx="${cx}" cy="${top}" rx="${headW / 2 + 3}" ry="${headH * 0.18}" fill="${color}"/>`;
    case "medium":
      return `<path d="M ${left - 3} ${cy - 2} Q ${left - 4} ${top - 8} ${cx} ${top - 10} Q ${right + 4} ${top - 8} ${right + 3} ${cy - 2}" fill="${color}"/>`;
    case "long":
      return `<path d="M ${left - 5} ${cy + headH * 0.35} Q ${left - 6} ${top - 12} ${cx} ${top - 12} Q ${right + 6} ${top - 12} ${right + 5} ${cy + headH * 0.35}" fill="${color}"/>`;
    case "curly":
      return `<ellipse cx="${cx}" cy="${top + 2}" rx="${headW / 2 + 8}" ry="${headH * 0.35}" fill="${color}"/>`
        + `<circle cx="${left - 4}" cy="${top + 8}" r="5" fill="${color}"/>`
        + `<circle cx="${right + 4}" cy="${top + 8}" r="5" fill="${color}"/>`
        + `<circle cx="${left}" cy="${top - 4}" r="4" fill="${color}"/>`
        + `<circle cx="${right}" cy="${top - 4}" r="4" fill="${color}"/>`;
    case "wavy":
      return `<path d="M ${left - 4} ${cy} Q ${left - 6} ${top - 8} ${cx} ${top - 10} Q ${right + 6} ${top - 8} ${right + 4} ${cy}" fill="${color}"/>`
        + `<path d="M ${left - 2} ${top + 10} Q ${left - 6} ${top + 5} ${left - 4} ${top}" fill="${color}"/>`
        + `<path d="M ${right + 2} ${top + 10} Q ${right + 6} ${top + 5} ${right + 4} ${top}" fill="${color}"/>`;
    case "mohawk":
      return `<rect x="${cx - 5}" y="${top - 14}" width="10" height="${headH * 0.35 + 14}" rx="5" fill="${color}"/>`;
    case "afro":
      return `<ellipse cx="${cx}" cy="${top + 2}" rx="${headW / 2 + 12}" ry="${headH * 0.45}" fill="${color}"/>`;
    case "ponytail":
      return `<ellipse cx="${cx}" cy="${top}" rx="${headW / 2 + 2}" ry="${headH * 0.16}" fill="${color}"/>`
        + `<ellipse cx="${cx + headW * 0.05}" cy="${cy + headH * 0.3}" rx="4" ry="8" fill="${color}" transform="rotate(15 ${cx + headW * 0.05} ${cy + headH * 0.3})"/>`;
    case "bangs":
      return `<path d="M ${left - 2} ${top + 8} Q ${left - 2} ${top - 8} ${cx} ${top - 8} Q ${right + 2} ${top - 8} ${right + 2} ${top + 8}" fill="${color}"/>`;
    case "sidepart":
      return `<path d="M ${left} ${top + 6} Q ${left - 2} ${top - 6} ${cx - 5} ${top - 8} Q ${right + 3} ${top - 7} ${right + 2} ${top + 6}" fill="${color}"/>`;
  }
}

function drawHairFront(style: HairStyle, g: Geo, color: string): string {
  const { cx, cy, headW, headH } = g;
  const top = cy - headH / 2;
  const left = cx - headW / 2;
  const right = cx + headW / 2;

  switch (style) {
    case "buzz":
      return `<path d="M ${left + 3} ${top + 4} Q ${cx} ${top - 1} ${right - 3} ${top + 4}" fill="${color}" opacity="0.5"/>`;
    case "bangs":
      return `<path d="M ${left + 2} ${top + 8} Q ${left + 2} ${top + 2} ${cx - 2} ${top + 1} L ${cx + 5} ${top + 3} Q ${cx + 8} ${top + 6} ${cx + 3} ${top + 10}" fill="${color}"/>`;
    case "sidepart":
      return `<path d="M ${left + 3} ${top + 5} Q ${cx - 8} ${top + 1} ${cx - 4} ${top + 2} L ${cx - 2} ${top + 6} Z" fill="${color}"/>`;
    default:
      return "";
  }
}

// ============================================================================
// Eyes rendering
// ============================================================================

function drawEyes(style: EyeStyle, g: Geo, featureColor: string, eyeColor: string): string {
  const { cx, eyeY, eyeSpacing } = g;
  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;

  switch (style) {
    case "round":
      return `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/><circle cx="${lx + 0.5}" cy="${eyeY - 0.5}" r="0.8" fill="white"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2" fill="${eyeColor}"/><circle cx="${rx + 0.5}" cy="${eyeY - 0.5}" r="0.8" fill="white"/>`;
    case "almond":
      return `<ellipse cx="${lx}" cy="${eyeY}" rx="4" ry="2.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="1.8" fill="${eyeColor}"/>`
        + `<ellipse cx="${rx}" cy="${eyeY}" rx="4" ry="2.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="1.8" fill="${eyeColor}"/>`;
    case "narrow":
      return `<ellipse cx="${lx}" cy="${eyeY}" rx="4" ry="1.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="1.2" fill="${eyeColor}"/>`
        + `<ellipse cx="${rx}" cy="${eyeY}" rx="4" ry="1.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="1.2" fill="${eyeColor}"/>`;
    case "wide":
      return `<circle cx="${lx}" cy="${eyeY}" r="4.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2.5" fill="${eyeColor}"/><circle cx="${lx + 0.8}" cy="${eyeY - 1}" r="1" fill="white"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="4.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2.5" fill="${eyeColor}"/><circle cx="${rx + 0.8}" cy="${eyeY - 1}" r="1" fill="white"/>`;
    case "sleepy":
      return `<ellipse cx="${lx}" cy="${eyeY}" rx="3.5" ry="2" fill="white"/><circle cx="${lx}" cy="${eyeY + 0.5}" r="1.5" fill="${eyeColor}"/><line x1="${lx - 3.5}" y1="${eyeY - 1}" x2="${lx + 3.5}" y2="${eyeY - 1}" stroke="${featureColor}" stroke-width="1"/>`
        + `<ellipse cx="${rx}" cy="${eyeY}" rx="3.5" ry="2" fill="white"/><circle cx="${rx}" cy="${eyeY + 0.5}" r="1.5" fill="${eyeColor}"/><line x1="${rx - 3.5}" y1="${eyeY - 1}" x2="${rx + 3.5}" y2="${eyeY - 1}" stroke="${featureColor}" stroke-width="1"/>`;
    case "winking":
      return `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`
        + `<path d="M ${rx - 3} ${eyeY} Q ${rx} ${eyeY - 3} ${rx + 3} ${eyeY}" fill="none" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "looking":
      return `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx + 1}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx + 1}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`;
    case "glasses":
      return `<circle cx="${lx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${lx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="3.5" fill="white"/><circle cx="${rx}" cy="${eyeY}" r="2" fill="${eyeColor}"/>`;
  }
}

// ============================================================================
// Eyebrows rendering
// ============================================================================

function drawEyebrows(style: EyebrowStyle, g: Geo, color: string): string {
  const { cx, browY, eyeSpacing } = g;
  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;

  switch (style) {
    case "natural":
      return `<path d="M ${lx - 4} ${browY + 1} Q ${lx} ${browY - 2} ${lx + 4} ${browY + 1}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<path d="M ${rx - 4} ${browY + 1} Q ${rx} ${browY - 2} ${rx + 4} ${browY + 1}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "thick":
      return `<path d="M ${lx - 4} ${browY + 1} Q ${lx} ${browY - 3} ${lx + 4} ${browY + 1}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`
        + `<path d="M ${rx - 4} ${browY + 1} Q ${rx} ${browY - 3} ${rx + 4} ${browY + 1}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "thin":
      return `<line x1="${lx - 4}" y1="${browY}" x2="${lx + 4}" y2="${browY - 1}" stroke="${color}" stroke-width="0.8" stroke-linecap="round"/>`
        + `<line x1="${rx - 4}" y1="${browY - 1}" x2="${rx + 4}" y2="${browY}" stroke="${color}" stroke-width="0.8" stroke-linecap="round"/>`;
    case "raised":
      return `<path d="M ${lx - 4} ${browY + 2} Q ${lx} ${browY - 4} ${lx + 4} ${browY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<path d="M ${rx - 4} ${browY} Q ${rx} ${browY - 4} ${rx + 4} ${browY + 2}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "furrowed":
      return `<line x1="${lx - 3}" y1="${browY - 1}" x2="${lx + 4}" y2="${browY + 2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<line x1="${rx - 4}" y1="${browY + 2}" x2="${rx + 3}" y2="${browY - 1}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "unibrow":
      return `<path d="M ${lx - 4} ${browY + 1} Q ${lx} ${browY - 2} ${cx} ${browY} Q ${rx} ${browY - 2} ${rx + 4} ${browY + 1}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
  }
}

// ============================================================================
// Nose rendering
// ============================================================================

function drawNose(style: NoseStyle, g: Geo, color: string): string {
  const { cx, noseY } = g;

  switch (style) {
    case "small":
      return `<circle cx="${cx}" cy="${noseY}" r="1.5" fill="${color}"/>`;
    case "pointed":
      return `<path d="M ${cx} ${noseY - 3} L ${cx + 3} ${noseY + 2} L ${cx - 3} ${noseY + 2} Z" fill="none" stroke="${color}" stroke-width="1" stroke-linejoin="round"/>`;
    case "round":
      return `<ellipse cx="${cx}" cy="${noseY}" rx="3" ry="2.5" fill="${color}" opacity="0.4"/>`;
    case "long":
      return `<path d="M ${cx} ${noseY - 5} Q ${cx + 2} ${noseY} ${cx} ${noseY + 3}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`;
    case "button":
      return `<circle cx="${cx}" cy="${noseY}" r="2.5" fill="${color}" opacity="0.3"/><circle cx="${cx - 1}" cy="${noseY + 0.5}" r="0.8" fill="${color}"/><circle cx="${cx + 1}" cy="${noseY + 0.5}" r="0.8" fill="${color}"/>`;
  }
}

// ============================================================================
// Mouth rendering
// ============================================================================

function drawMouth(style: MouthStyle, g: Geo, color: string): string {
  const { cx, mouthY } = g;

  switch (style) {
    case "smile":
      return `<path d="M ${cx - 6} ${mouthY} Q ${cx} ${mouthY + 7} ${cx + 6} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "bigSmile":
      return `<path d="M ${cx - 8} ${mouthY} Q ${cx} ${mouthY + 10} ${cx + 8} ${mouthY}" fill="#fff" stroke="${color}" stroke-width="1.5"/>`
        + `<path d="M ${cx - 5} ${mouthY + 5} Q ${cx} ${mouthY + 8} ${cx + 5} ${mouthY + 5}" fill="#FF6B6B" opacity="0.5"/>`;
    case "neutral":
      return `<line x1="${cx - 5}" y1="${mouthY + 2}" x2="${cx + 5}" y2="${mouthY + 2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "frown":
      return `<path d="M ${cx - 5} ${mouthY + 4} Q ${cx} ${mouthY - 2} ${cx + 5} ${mouthY + 4}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "open":
      return `<ellipse cx="${cx}" cy="${mouthY + 3}" rx="5" ry="4" fill="#4a2020"/><ellipse cx="${cx}" cy="${mouthY + 5}" rx="3" ry="2" fill="#FF6B6B" opacity="0.6"/>`;
    case "smirk":
      return `<path d="M ${cx - 4} ${mouthY + 2} Q ${cx + 2} ${mouthY + 5} ${cx + 6} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "tongue":
      return `<path d="M ${cx - 5} ${mouthY} Q ${cx} ${mouthY + 6} ${cx + 5} ${mouthY}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<ellipse cx="${cx}" cy="${mouthY + 5}" rx="3" ry="2.5" fill="#FF6B6B"/>`;
    case "teeth":
      return `<path d="M ${cx - 6} ${mouthY} Q ${cx} ${mouthY + 7} ${cx + 6} ${mouthY}" fill="#fff" stroke="${color}" stroke-width="1.5"/>`
        + `<line x1="${cx}" y1="${mouthY + 1}" x2="${cx}" y2="${mouthY + 5}" stroke="${color}" stroke-width="0.5"/>`;
  }
}

// ============================================================================
// Accessories rendering
// ============================================================================

function drawGlasses(type: GlassesType, g: Geo, color: string): string {
  const { cx, eyeY, eyeSpacing } = g;
  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;
  const bridge = `<line x1="${lx + 5}" y1="${eyeY - 1}" x2="${rx - 5}" y2="${eyeY - 1}" stroke="${color}" stroke-width="1"/>`;

  switch (type) {
    case "round":
      return `<circle cx="${lx}" cy="${eyeY}" r="5.5" fill="none" stroke="${color}" stroke-width="1.5"/>`
        + `<circle cx="${rx}" cy="${eyeY}" r="5.5" fill="none" stroke="${color}" stroke-width="1.5"/>`
        + bridge;
    case "square":
      return `<rect x="${lx - 5}" y="${eyeY - 4}" width="10" height="8" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>`
        + `<rect x="${rx - 5}" y="${eyeY - 4}" width="10" height="8" rx="1" fill="none" stroke="${color}" stroke-width="1.5"/>`
        + bridge;
    case "aviator":
      return `<path d="M ${lx - 6} ${eyeY - 3} Q ${lx - 6} ${eyeY + 5} ${lx} ${eyeY + 5} Q ${lx + 6} ${eyeY + 5} ${lx + 6} ${eyeY - 3} Q ${lx + 6} ${eyeY - 5} ${lx} ${eyeY - 5} Q ${lx - 6} ${eyeY - 5} ${lx - 6} ${eyeY - 3} Z" fill="none" stroke="${color}" stroke-width="1.2"/>`
        + `<path d="M ${rx - 6} ${eyeY - 3} Q ${rx - 6} ${eyeY + 5} ${rx} ${eyeY + 5} Q ${rx + 6} ${eyeY + 5} ${rx + 6} ${eyeY - 3} Q ${rx + 6} ${eyeY - 5} ${rx} ${eyeY - 5} Q ${rx - 6} ${eyeY - 5} ${rx - 6} ${eyeY - 3} Z" fill="none" stroke="${color}" stroke-width="1.2"/>`
        + bridge;
  }
}

function drawHat(type: HatType, g: Geo, color: string): string {
  const { cx, cy, headW, headH } = g;
  const top = cy - headH / 2;

  switch (type) {
    case "beanie":
      return `<path d="M ${cx - headW / 2 - 2} ${top + 5} Q ${cx - headW / 2 - 2} ${top - 12} ${cx} ${top - 14} Q ${cx + headW / 2 + 2} ${top - 12} ${cx + headW / 2 + 2} ${top + 5}" fill="${color}"/>`
        + `<rect x="${cx - headW / 2 - 3}" y="${top + 2}" width="${headW + 6}" height="5" rx="2" fill="${color}" opacity="0.7"/>`;
    case "cap":
      return `<path d="M ${cx - headW / 2 - 2} ${top + 3} Q ${cx} ${top - 10} ${cx + headW / 2 + 2} ${top + 3}" fill="${color}"/>`
        + `<rect x="${cx - headW / 2 - 8}" y="${top + 1}" width="${headW + 16}" height="3" rx="1.5" fill="${color}" opacity="0.8"/>`;
    case "tophat":
      return `<rect x="${cx - 8}" y="${top - 18}" width="16" height="18" rx="2" fill="${color}"/>`
        + `<rect x="${cx - headW / 2 - 4}" y="${top - 2}" width="${headW + 8}" height="4" rx="2" fill="${color}"/>`;
  }
}

function drawEarrings(g: Geo, color: string): string {
  const { cx, eyeY, headW } = g;
  const earY = eyeY + 4;
  return `<circle cx="${cx - headW / 2 - 2}" cy="${earY}" r="1.5" fill="${color}"/>`
    + `<circle cx="${cx + headW / 2 + 2}" cy="${earY}" r="1.5" fill="${color}"/>`;
}

function drawFacialHair(type: FacialHairType, g: Geo, color: string): string {
  const { cx, mouthY, headW } = g;

  switch (type) {
    case "stubble":
      return `<rect x="${cx - headW * 0.3}" y="${mouthY - 2}" width="${headW * 0.6}" height="${headW * 0.25}" rx="3" fill="${color}" opacity="0.2"/>`;
    case "mustache":
      return `<path d="M ${cx - 7} ${mouthY - 1} Q ${cx - 3} ${mouthY - 4} ${cx} ${mouthY - 2} Q ${cx + 3} ${mouthY - 4} ${cx + 7} ${mouthY - 1}" fill="${color}"/>`;
    case "beard":
      return `<path d="M ${cx - headW * 0.3} ${mouthY} Q ${cx - headW * 0.35} ${mouthY + 12} ${cx} ${mouthY + 14} Q ${cx + headW * 0.35} ${mouthY + 12} ${cx + headW * 0.3} ${mouthY}" fill="${color}"/>`;
  }
}

// ============================================================================
// Main content builder
// ============================================================================

function createIllustratedContent(options: IllustratedOptions): string {
  const size = options.size ?? 64;
  const skinTones = options.skinTones ?? SKIN_TONES;
  const eyeColorPalette = options.eyeColors ?? EYE_COLORS;
  const colors = options.colors ?? DEFAULT_COLORS;
  const random = createRandom(options.seed);

  const skinColor = random.pick(skinTones);
  const hairColor = random.pick(colors);
  const featureColor = "#2C1810";
  const eyeColor = random.pick(eyeColorPalette);
  const g = computeGeo(size);

  // Pick features
  const hairStyle: HairStyle = (options.hairStyle as HairStyle) ?? random.pick(HAIR_STYLES);
  const eyeStyle: EyeStyle = (options.eyeStyle as EyeStyle) ?? random.pick(EYE_STYLES);
  const eyebrowStyle: EyebrowStyle = (options.eyebrowStyle as EyebrowStyle) ?? random.pick(EYEBROW_STYLES);
  const noseStyle: NoseStyle = (options.noseStyle as NoseStyle) ?? random.pick(NOSE_STYLES);
  const mouthStyle: MouthStyle = (options.mouthStyle as MouthStyle) ?? random.pick(MOUTH_STYLES);

  // Accessories probabilities
  const hasGlasses = (options.glasses !== false) && random.bool(0.2);
  const hasHat = (options.hat !== false) && random.bool(0.1);
  const hasEarrings = (options.earrings !== false) && random.bool(0.08);
  const hasFacialHair = (options.facialHair !== false) && random.bool(0.15);

  const glassesType = hasGlasses ? random.pick(GLASSES_TYPES) : null;
  const hatType = hasHat ? random.pick(HAT_TYPES) : null;
  const facialHairType = hasFacialHair ? random.pick(FACIAL_HAIR_TYPES) : null;

  let content = "";

  // Render order: hair-behind → ears → head → hair-front → eyebrows → eyes → nose → mouth → facial hair → glasses → hat

  // 1. Hair behind
  content += drawHairBehind(hairStyle, g, hairColor);

  // 2. Ears
  const earR = size * 0.055;
  const earY = g.eyeY + 2;
  content += `<ellipse cx="${g.cx - g.headW / 2 - earR * 0.5}" cy="${earY}" rx="${earR}" ry="${earR * 1.2}" fill="${skinColor}"/>`;
  content += `<ellipse cx="${g.cx + g.headW / 2 + earR * 0.5}" cy="${earY}" rx="${earR}" ry="${earR * 1.2}" fill="${skinColor}"/>`;

  // 3. Head
  content += `<ellipse cx="${g.cx}" cy="${g.cy}" rx="${g.headW / 2}" ry="${g.headH / 2}" fill="${skinColor}"/>`;

  // 4. Hair front
  content += drawHairFront(hairStyle, g, hairColor);

  // 5. Eyebrows
  content += drawEyebrows(eyebrowStyle, g, featureColor);

  // 6. Eyes
  content += drawEyes(eyeStyle, g, featureColor, eyeColor);

  // 7. Nose
  content += drawNose(noseStyle, g, featureColor);

  // 8. Mouth
  content += drawMouth(mouthStyle, g, featureColor);

  // 9. Facial hair
  if (facialHairType) {
    content += drawFacialHair(facialHairType, g, hairColor);
  }

  // 10. Glasses
  if (glassesType) {
    content += drawGlasses(glassesType, g, featureColor);
  }

  // 11. Earrings
  if (hasEarrings) {
    const earringColor = random.pick(colors);
    content += drawEarrings(g, earringColor);
  }

  // 12. Hat (drawn last, on top of everything)
  if (hatType) {
    const hatColor = random.pick(colors);
    content += drawHat(hatType, g, hatColor);
  }

  return content;
}

/**
 * Illustrated avatar style
 *
 * Creates detailed cartoon face avatars with varied hair, eyes, eyebrows,
 * nose, mouth, and optional accessories (glasses, hats, earrings, facial hair).
 * Over 1.7M+ unique combinations before accessories.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { illustrated } from '@avatar-generator/style-illustrated';
 *
 * const avatar = createAvatar(illustrated, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const illustrated: Style<IllustratedOptions> = {
  name: "illustrated",

  create(options: IllustratedOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createIllustratedContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default illustrated;
export type { IllustratedOptions };
