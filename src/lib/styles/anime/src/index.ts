import type { Style, AnimeOptions, AvatarResult } from "@avatar-generator/core";
import type { Random } from "@avatar-generator/core";
import { createRandom, DEFAULT_COLORS, SKIN_TONES, EYE_COLORS, buildSvg } from "@avatar-generator/core";

// ============================================================================
// Feature variant types
// ============================================================================

type HairStyle = "short-spiky" | "medium-messy" | "long-straight" | "twin-tails" | "ponytail" | "side-swept" | "wild" | "bob" | "hime-cut" | "shaggy";
type EyeStyle = "normal" | "sparkly" | "determined" | "gentle" | "cat" | "half-closed" | "closed-happy" | "surprised";
type MouthStyle = "small-smile" | "open-small" | "cat-mouth" | "line" | "pout" | "grin";
type NoseStyle = "dot" | "line" | "shadow";
type EyebrowStyle = "natural" | "furrowed" | "raised" | "thin";

const HAIR_STYLES: HairStyle[] = ["short-spiky", "medium-messy", "long-straight", "twin-tails", "ponytail", "side-swept", "wild", "bob", "hime-cut", "shaggy"];
const EYE_STYLES: EyeStyle[] = ["normal", "sparkly", "determined", "gentle", "cat", "half-closed", "closed-happy", "surprised"];
const MOUTH_STYLES: MouthStyle[] = ["small-smile", "open-small", "cat-mouth", "line", "pout", "grin"];
const NOSE_STYLES: NoseStyle[] = ["dot", "line", "shadow"];
const EYEBROW_STYLES: EyebrowStyle[] = ["natural", "furrowed", "raised", "thin"];

// Anime-typical hair colors (includes unnatural colors)
const ANIME_HAIR_COLORS = [
  "#1a1a2e", "#2d1b36", "#4a1942", "#c23616", "#e17055",
  "#0984e3", "#6c5ce7", "#fd79a8", "#ffeaa7", "#dfe6e9",
  "#2d3436", "#b2bec3",
];

// ============================================================================
// Geometry helper
// ============================================================================

interface AnimeGeo {
  size: number;
  cx: number;
  cy: number;
  headW: number;
  headH: number;
  faceTop: number;
  chinY: number;
  eyeY: number;
  eyeSpacing: number;
  eyeRx: number;
  eyeRy: number;
  irisR: number;
  browY: number;
  noseY: number;
  mouthY: number;
}

function computeGeo(size: number): AnimeGeo {
  const cx = size / 2;
  const cy = size * 0.50;
  const headW = size * 0.56;
  const headH = size * 0.72;
  const eyeRy = headH * 0.115;
  return {
    size,
    cx,
    cy,
    headW,
    headH,
    faceTop: cy - headH * 0.52,
    chinY: cy + headH * 0.50,
    eyeY: cy - headH * 0.08,
    eyeSpacing: headW * 0.24,
    eyeRx: headW * 0.115,
    eyeRy,
    irisR: eyeRy * 0.82,
    browY: cy - headH * 0.08 - eyeRy * 1.4,
    noseY: cy + headH * 0.10,
    mouthY: cy + headH * 0.32,
  };
}

// ============================================================================
// Face shape (V-chin bezier path)
// ============================================================================

function drawFace(g: AnimeGeo, skinColor: string): string {
  const { cx, cy, headW, headH, faceTop, chinY } = g;
  const halfW = headW / 2;
  // V-chin bezier: wide at temples, tapering to pointed chin
  const templeY = cy - headH * 0.20;
  const jawY = cy + headH * 0.25;
  return `<path d="M ${cx} ${faceTop} `
    + `Q ${cx + halfW * 0.8} ${faceTop} ${cx + halfW} ${templeY} `
    + `Q ${cx + halfW * 1.02} ${jawY} ${cx + halfW * 0.25} ${chinY - 2} `
    + `Q ${cx + halfW * 0.08} ${chinY + 1} ${cx} ${chinY + 2} `
    + `Q ${cx - halfW * 0.08} ${chinY + 1} ${cx - halfW * 0.25} ${chinY - 2} `
    + `Q ${cx - halfW * 1.02} ${jawY} ${cx - halfW} ${templeY} `
    + `Q ${cx - halfW * 0.8} ${faceTop} ${cx} ${faceTop} Z" `
    + `fill="${skinColor}"/>`;
}

// ============================================================================
// Ears
// ============================================================================

function drawEars(g: AnimeGeo, skinColor: string): string {
  const { cx, headW, eyeY } = g;
  const earR = g.size * 0.04;
  const earY = eyeY + 2;
  return `<ellipse cx="${cx - headW / 2 - earR * 0.3}" cy="${earY}" rx="${earR}" ry="${earR * 1.3}" fill="${skinColor}"/>`
    + `<ellipse cx="${cx + headW / 2 + earR * 0.3}" cy="${earY}" rx="${earR}" ry="${earR * 1.3}" fill="${skinColor}"/>`;
}

// ============================================================================
// Hair rendering — sharp polygons + layered bangs
// ============================================================================

function drawHairBehind(style: HairStyle, g: AnimeGeo, color: string): string {
  const { cx, cy, headW, headH, faceTop } = g;
  const halfW = headW / 2;
  const top = faceTop - 4;

  switch (style) {
    case "short-spiky":
      return `<path d="M ${cx - halfW - 4} ${cy + 2} L ${cx - halfW - 6} ${top - 6} L ${cx - halfW * 0.5} ${top - 10} L ${cx} ${top - 14} L ${cx + halfW * 0.5} ${top - 10} L ${cx + halfW + 6} ${top - 6} L ${cx + halfW + 4} ${cy + 2} Z" fill="${color}"/>`;
    case "medium-messy":
      return `<path d="M ${cx - halfW - 5} ${cy + 6} L ${cx - halfW - 8} ${top - 4} L ${cx - halfW * 0.3} ${top - 12} L ${cx + 2} ${top - 16} L ${cx + halfW * 0.4} ${top - 10} L ${cx + halfW + 8} ${top - 4} L ${cx + halfW + 5} ${cy + 6} Z" fill="${color}"/>`;
    case "long-straight":
      return `<path d="M ${cx - halfW - 6} ${cy + headH * 0.45} L ${cx - halfW - 6} ${top - 8} L ${cx} ${top - 12} L ${cx + halfW + 6} ${top - 8} L ${cx + halfW + 6} ${cy + headH * 0.45} Q ${cx + halfW + 4} ${cy + headH * 0.5} ${cx + halfW + 2} ${cy + headH * 0.45} L ${cx - halfW - 2} ${cy + headH * 0.45} Z" fill="${color}"/>`;
    case "twin-tails":
      return `<path d="M ${cx - halfW - 3} ${cy} L ${cx - halfW - 3} ${top - 6} L ${cx} ${top - 10} L ${cx + halfW + 3} ${top - 6} L ${cx + halfW + 3} ${cy} Z" fill="${color}"/>`
        + `<ellipse cx="${cx - halfW - 6}" cy="${cy + headH * 0.15}" rx="5" ry="12" fill="${color}" transform="rotate(-10 ${cx - halfW - 6} ${cy + headH * 0.15})"/>`
        + `<ellipse cx="${cx + halfW + 6}" cy="${cy + headH * 0.15}" rx="5" ry="12" fill="${color}" transform="rotate(10 ${cx + halfW + 6} ${cy + headH * 0.15})"/>`;
    case "ponytail":
      return `<path d="M ${cx - halfW - 3} ${cy - 2} L ${cx - halfW - 3} ${top - 6} L ${cx} ${top - 10} L ${cx + halfW + 3} ${top - 6} L ${cx + halfW + 3} ${cy - 2} Z" fill="${color}"/>`
        + `<ellipse cx="${cx + halfW * 0.2}" cy="${cy + headH * 0.3}" rx="4" ry="10" fill="${color}" transform="rotate(8 ${cx + halfW * 0.2} ${cy + headH * 0.3})"/>`;
    case "side-swept":
      return `<path d="M ${cx - halfW - 6} ${cy + 4} L ${cx - halfW - 8} ${top - 6} L ${cx - halfW * 0.2} ${top - 14} L ${cx + halfW * 0.6} ${top - 10} L ${cx + halfW + 4} ${top - 4} L ${cx + halfW + 4} ${cy + 2} Z" fill="${color}"/>`;
    case "wild":
      return `<path d="M ${cx - halfW - 8} ${cy + 8} L ${cx - halfW - 12} ${top - 10} L ${cx - halfW * 0.6} ${top - 18} L ${cx - 2} ${top - 14} L ${cx + halfW * 0.5} ${top - 20} L ${cx + halfW + 10} ${top - 8} L ${cx + halfW + 8} ${cy + 8} Z" fill="${color}"/>`;
    case "bob":
      return `<path d="M ${cx - halfW - 4} ${cy + headH * 0.1} Q ${cx - halfW - 5} ${top - 6} ${cx} ${top - 10} Q ${cx + halfW + 5} ${top - 6} ${cx + halfW + 4} ${cy + headH * 0.1} Q ${cx + halfW + 2} ${cy + headH * 0.15} ${cx + halfW} ${cy + headH * 0.12} L ${cx - halfW} ${cy + headH * 0.12} Z" fill="${color}"/>`;
    case "hime-cut":
      return `<path d="M ${cx - halfW - 5} ${cy + headH * 0.35} L ${cx - halfW - 5} ${top - 8} L ${cx} ${top - 12} L ${cx + halfW + 5} ${top - 8} L ${cx + halfW + 5} ${cy + headH * 0.35} Z" fill="${color}"/>`
        + `<rect x="${cx - halfW - 6}" y="${cy - headH * 0.1}" width="6" height="${headH * 0.45}" rx="2" fill="${color}"/>`
        + `<rect x="${cx + halfW}" y="${cy - headH * 0.1}" width="6" height="${headH * 0.45}" rx="2" fill="${color}"/>`;
    case "shaggy":
      return `<path d="M ${cx - halfW - 6} ${cy + 6} L ${cx - halfW - 9} ${top - 4} L ${cx - halfW * 0.4} ${top - 14} L ${cx + halfW * 0.3} ${top - 12} L ${cx + halfW + 9} ${top - 4} L ${cx + halfW + 6} ${cy + 6} Z" fill="${color}"/>`;
  }
}

function drawHairFront(style: HairStyle, g: AnimeGeo, color: string, hasBangs: boolean): string {
  const { cx, cy, headW, headH, faceTop } = g;
  const halfW = headW / 2;
  const top = faceTop - 2;

  // Bangs layer — sharp polygon spikes over forehead
  let bangs = "";
  if (hasBangs) {
    const bangBase = faceTop + headH * 0.12;
    bangs = `<path d="M ${cx - halfW * 0.9} ${top} `
      + `L ${cx - halfW * 0.7} ${bangBase + 3} `
      + `L ${cx - halfW * 0.45} ${top + 2} `
      + `L ${cx - halfW * 0.2} ${bangBase + 5} `
      + `L ${cx} ${top + 1} `
      + `L ${cx + halfW * 0.2} ${bangBase + 5} `
      + `L ${cx + halfW * 0.45} ${top + 2} `
      + `L ${cx + halfW * 0.7} ${bangBase + 3} `
      + `L ${cx + halfW * 0.9} ${top} Z" fill="${color}"/>`;
  }

  // Style-specific front hair details
  let detail = "";
  switch (style) {
    case "short-spiky":
      detail = `<polygon points="${cx - 4},${top - 2} ${cx - 2},${top - 10} ${cx},${top - 3} ${cx + 2},${top - 12} ${cx + 4},${top - 2}" fill="${color}"/>`;
      break;
    case "medium-messy":
      detail = `<polygon points="${cx - 6},${top} ${cx - 3},${top - 8} ${cx + 1},${top - 2} ${cx + 4},${top - 10} ${cx + 6},${top}" fill="${color}"/>`;
      break;
    case "wild":
      detail = `<polygon points="${cx - 8},${top + 2} ${cx - 5},${top - 12} ${cx - 1},${top} ${cx + 3},${top - 14} ${cx + 7},${top + 2}" fill="${color}"/>`
        + `<polygon points="${cx - halfW - 4},${cy - headH * 0.15} ${cx - halfW - 10},${cy - headH * 0.3} ${cx - halfW - 3},${cy - headH * 0.25}" fill="${color}"/>`;
      break;
    case "side-swept": {
      const bangBase = faceTop + headH * 0.14;
      detail = `<path d="M ${cx - halfW * 0.8} ${top} L ${cx - halfW * 0.5} ${bangBase + 6} L ${cx - halfW * 0.1} ${top + 2} L ${cx + halfW * 0.3} ${bangBase + 4} L ${cx + halfW * 0.6} ${top + 1}" fill="${color}"/>`;
      break;
    }
    default:
      break;
  }

  return bangs + detail;
}

// ============================================================================
// Eyes rendering — the star feature (multi-layer)
// ============================================================================

function drawEyes(style: EyeStyle, g: AnimeGeo, featureColor: string, eyeColor: string): string {
  const { cx, eyeY, eyeSpacing, eyeRx, eyeRy, irisR } = g;
  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;

  function drawSingleEye(ex: number, mirrored: boolean): string {
    const hlOff = mirrored ? -0.8 : 0.8;

    switch (style) {
      case "normal":
        return `<ellipse cx="${ex}" cy="${eyeY + 0.5}" rx="${eyeRx + 0.5}" ry="${eyeRy + 0.5}" fill="#e8e0d8" opacity="0.3"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="white"/>`
          + `<circle cx="${ex}" cy="${eyeY + 0.5}" r="${irisR}" fill="${eyeColor}"/>`
          + `<circle cx="${ex}" cy="${eyeY + 1}" r="${irisR * 0.5}" fill="${featureColor}"/>`
          + `<ellipse cx="${ex}" cy="${eyeY - eyeRy * 0.6}" rx="${eyeRx * 0.9}" ry="${eyeRy * 0.18}" fill="${featureColor}" opacity="0.15"/>`
          + `<path d="M ${ex - eyeRx} ${eyeY - eyeRy * 0.7} Q ${ex} ${eyeY - eyeRy * 1.1} ${ex + eyeRx} ${eyeY - eyeRy * 0.7}" fill="none" stroke="${featureColor}" stroke-width="1.2" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.5}" cy="${eyeY - irisR * 0.5}" r="${irisR * 0.32}" fill="white"/>`
          + `<circle cx="${ex - hlOff}" cy="${eyeY + irisR * 0.3}" r="${irisR * 0.18}" fill="white"/>`;

      case "sparkly":
        return `<ellipse cx="${ex}" cy="${eyeY + 0.5}" rx="${eyeRx + 0.5}" ry="${eyeRy + 0.5}" fill="#e8e0d8" opacity="0.3"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="white"/>`
          + `<circle cx="${ex}" cy="${eyeY + 0.5}" r="${irisR}" fill="${eyeColor}"/>`
          + `<circle cx="${ex}" cy="${eyeY + 1}" r="${irisR * 0.45}" fill="${featureColor}"/>`
          + `<ellipse cx="${ex}" cy="${eyeY - eyeRy * 0.6}" rx="${eyeRx * 0.9}" ry="${eyeRy * 0.18}" fill="${featureColor}" opacity="0.15"/>`
          + `<path d="M ${ex - eyeRx} ${eyeY - eyeRy * 0.7} Q ${ex} ${eyeY - eyeRy * 1.1} ${ex + eyeRx} ${eyeY - eyeRy * 0.7}" fill="none" stroke="${featureColor}" stroke-width="1.2" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.8}" cy="${eyeY - irisR * 0.6}" r="${irisR * 0.38}" fill="white"/>`
          + `<circle cx="${ex - hlOff * 1.2}" cy="${eyeY + irisR * 0.2}" r="${irisR * 0.22}" fill="white"/>`
          + `<circle cx="${ex + hlOff * 0.5}" cy="${eyeY + irisR * 0.5}" r="${irisR * 0.14}" fill="white" opacity="0.7"/>`;

      case "determined":
        return `<ellipse cx="${ex}" cy="${eyeY + 0.5}" rx="${eyeRx + 0.5}" ry="${eyeRy + 0.3}" fill="#e8e0d8" opacity="0.3"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy * 0.85}" fill="white"/>`
          + `<circle cx="${ex}" cy="${eyeY + 0.5}" r="${irisR * 0.95}" fill="${eyeColor}"/>`
          + `<circle cx="${ex}" cy="${eyeY + 1}" r="${irisR * 0.5}" fill="${featureColor}"/>`
          + `<line x1="${ex - eyeRx}" y1="${eyeY - eyeRy * 0.6}" x2="${ex + eyeRx}" y2="${eyeY - eyeRy * 0.85}" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.5}" cy="${eyeY - irisR * 0.4}" r="${irisR * 0.3}" fill="white"/>`
          + `<circle cx="${ex - hlOff}" cy="${eyeY + irisR * 0.3}" r="${irisR * 0.16}" fill="white"/>`;

      case "gentle":
        return `<ellipse cx="${ex}" cy="${eyeY + 0.5}" rx="${eyeRx + 0.5}" ry="${eyeRy + 0.5}" fill="#e8e0d8" opacity="0.3"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy * 1.05}" fill="white"/>`
          + `<circle cx="${ex}" cy="${eyeY + 1}" r="${irisR * 1.05}" fill="${eyeColor}"/>`
          + `<circle cx="${ex}" cy="${eyeY + 1.5}" r="${irisR * 0.5}" fill="${featureColor}"/>`
          + `<path d="M ${ex - eyeRx * 0.7} ${eyeY - eyeRy * 0.5} Q ${ex} ${eyeY - eyeRy * 0.9} ${ex + eyeRx * 0.7} ${eyeY - eyeRy * 0.5}" fill="none" stroke="${featureColor}" stroke-width="1" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.5}" cy="${eyeY - irisR * 0.3}" r="${irisR * 0.35}" fill="white"/>`
          + `<circle cx="${ex - hlOff}" cy="${eyeY + irisR * 0.4}" r="${irisR * 0.2}" fill="white"/>`;

      case "cat":
        return `<ellipse cx="${ex}" cy="${eyeY + 0.5}" rx="${eyeRx + 0.5}" ry="${eyeRy * 0.75}" fill="#e8e0d8" opacity="0.3"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy * 0.7}" fill="white"/>`
          + `<ellipse cx="${ex}" cy="${eyeY + 0.3}" rx="${irisR * 0.35}" ry="${irisR * 0.9}" fill="${featureColor}"/>`
          + `<ellipse cx="${ex}" cy="${eyeY}" rx="${irisR}" ry="${eyeRy * 0.65}" fill="${eyeColor}" opacity="0.6"/>`
          + `<path d="M ${ex - eyeRx * 1.1} ${eyeY - eyeRy * 0.3} Q ${ex} ${eyeY - eyeRy * 0.9} ${ex + eyeRx * 1.1} ${eyeY - eyeRy * 0.3}" fill="none" stroke="${featureColor}" stroke-width="1.3" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.5}" cy="${eyeY - irisR * 0.3}" r="${irisR * 0.25}" fill="white"/>`;

      case "half-closed":
        return `<ellipse cx="${ex}" cy="${eyeY + 1}" rx="${eyeRx}" ry="${eyeRy * 0.5}" fill="white"/>`
          + `<ellipse cx="${ex}" cy="${eyeY + 1.3}" rx="${irisR * 0.9}" ry="${irisR * 0.45}" fill="${eyeColor}"/>`
          + `<ellipse cx="${ex}" cy="${eyeY + 1.5}" rx="${irisR * 0.5}" ry="${irisR * 0.3}" fill="${featureColor}"/>`
          + `<line x1="${ex - eyeRx}" y1="${eyeY + 0.3}" x2="${ex + eyeRx}" y2="${eyeY + 0.3}" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff}" cy="${eyeY + 0.8}" r="${irisR * 0.2}" fill="white"/>`;

      case "closed-happy":
        return `<path d="M ${ex - eyeRx} ${eyeY + 1} Q ${ex} ${eyeY - eyeRy * 0.8} ${ex + eyeRx} ${eyeY + 1}" fill="none" stroke="${featureColor}" stroke-width="1.5" stroke-linecap="round"/>`;

      case "surprised":
        return `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeRx * 1.1}" ry="${eyeRy * 1.15}" fill="white"/>`
          + `<circle cx="${ex}" cy="${eyeY}" r="${irisR * 0.9}" fill="${eyeColor}"/>`
          + `<circle cx="${ex}" cy="${eyeY + 0.5}" r="${irisR * 0.45}" fill="${featureColor}"/>`
          + `<path d="M ${ex - eyeRx * 1.1} ${eyeY - eyeRy * 0.85} Q ${ex} ${eyeY - eyeRy * 1.3} ${ex + eyeRx * 1.1} ${eyeY - eyeRy * 0.85}" fill="none" stroke="${featureColor}" stroke-width="1.3" stroke-linecap="round"/>`
          + `<circle cx="${ex + hlOff * 1.8}" cy="${eyeY - irisR * 0.6}" r="${irisR * 0.35}" fill="white"/>`
          + `<circle cx="${ex - hlOff}" cy="${eyeY + irisR * 0.3}" r="${irisR * 0.18}" fill="white"/>`;
    }
  }

  return drawSingleEye(lx, false) + drawSingleEye(rx, true);
}

// ============================================================================
// Eyebrows rendering
// ============================================================================

function drawEyebrows(style: EyebrowStyle, g: AnimeGeo, color: string): string {
  const { cx, browY, eyeSpacing, eyeRx } = g;
  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;
  const bw = eyeRx * 1.1;

  switch (style) {
    case "natural":
      return `<path d="M ${lx - bw} ${browY + 1} Q ${lx} ${browY - 2} ${lx + bw} ${browY}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`
        + `<path d="M ${rx - bw} ${browY} Q ${rx} ${browY - 2} ${rx + bw} ${browY + 1}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`;
    case "furrowed":
      return `<line x1="${lx - bw}" y1="${browY - 1}" x2="${lx + bw}" y2="${browY + 2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
        + `<line x1="${rx - bw}" y1="${browY + 2}" x2="${rx + bw}" y2="${browY - 1}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
    case "raised":
      return `<path d="M ${lx - bw} ${browY + 2} Q ${lx} ${browY - 4} ${lx + bw} ${browY + 1}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`
        + `<path d="M ${rx - bw} ${browY + 1} Q ${rx} ${browY - 4} ${rx + bw} ${browY + 2}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`;
    case "thin":
      return `<line x1="${lx - bw}" y1="${browY}" x2="${lx + bw}" y2="${browY - 0.5}" stroke="${color}" stroke-width="0.7" stroke-linecap="round"/>`
        + `<line x1="${rx - bw}" y1="${browY - 0.5}" x2="${rx + bw}" y2="${browY}" stroke="${color}" stroke-width="0.7" stroke-linecap="round"/>`;
  }
}

// ============================================================================
// Nose rendering — minimal
// ============================================================================

function drawNose(style: NoseStyle, g: AnimeGeo, color: string): string {
  const { cx, noseY } = g;

  switch (style) {
    case "dot":
      return `<circle cx="${cx}" cy="${noseY}" r="1" fill="${color}" opacity="0.5"/>`;
    case "line":
      return `<path d="M ${cx + 0.5} ${noseY - 2} L ${cx + 0.5} ${noseY + 1} L ${cx - 1} ${noseY + 1}" fill="none" stroke="${color}" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>`;
    case "shadow":
      return `<ellipse cx="${cx}" cy="${noseY}" rx="1.5" ry="1" fill="${color}" opacity="0.2"/>`;
  }
}

// ============================================================================
// Mouth rendering — small, positioned lower
// ============================================================================

function drawMouth(style: MouthStyle, g: AnimeGeo, color: string): string {
  const { cx, mouthY } = g;

  switch (style) {
    case "small-smile":
      return `<path d="M ${cx - 3} ${mouthY} Q ${cx} ${mouthY + 3} ${cx + 3} ${mouthY}" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round"/>`;
    case "open-small":
      return `<ellipse cx="${cx}" cy="${mouthY + 1}" rx="2.5" ry="2" fill="#4a2020"/>`
        + `<ellipse cx="${cx}" cy="${mouthY + 2}" rx="1.5" ry="0.8" fill="#FF6B6B" opacity="0.5"/>`;
    case "cat-mouth":
      // :3 shape
      return `<path d="M ${cx - 3.5} ${mouthY + 1} Q ${cx - 1.5} ${mouthY + 3.5} ${cx} ${mouthY + 1}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linecap="round"/>`
        + `<path d="M ${cx} ${mouthY + 1} Q ${cx + 1.5} ${mouthY + 3.5} ${cx + 3.5} ${mouthY + 1}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linecap="round"/>`;
    case "line":
      return `<line x1="${cx - 2.5}" y1="${mouthY + 1}" x2="${cx + 2.5}" y2="${mouthY + 1}" stroke="${color}" stroke-width="1" stroke-linecap="round"/>`;
    case "pout":
      return `<path d="M ${cx - 2.5} ${mouthY + 1.5} Q ${cx} ${mouthY - 1} ${cx + 2.5} ${mouthY + 1.5}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`;
    case "grin":
      return `<path d="M ${cx - 4} ${mouthY} Q ${cx} ${mouthY + 5} ${cx + 4} ${mouthY}" fill="white" stroke="${color}" stroke-width="0.8"/>`
        + `<path d="M ${cx - 3} ${mouthY + 3} Q ${cx} ${mouthY + 4.5} ${cx + 3} ${mouthY + 3}" fill="#FF6B6B" opacity="0.4"/>`;
  }
}

// ============================================================================
// Expressions — anime-specific
// ============================================================================

function drawExpressions(random: Random, g: AnimeGeo, hasBlush: boolean): string {
  const { cx, cy, headW, eyeY, eyeRy, faceTop } = g;
  let content = "";

  // Blush — pink ovals on cheeks (35%)
  if (hasBlush) {
    const blushY = eyeY + eyeRy * 1.8;
    const blushSpacing = headW * 0.28;
    content += `<ellipse cx="${cx - blushSpacing}" cy="${blushY}" rx="3.5" ry="2" fill="#FF9999" opacity="0.35"/>`
      + `<ellipse cx="${cx + blushSpacing}" cy="${blushY}" rx="3.5" ry="2" fill="#FF9999" opacity="0.35"/>`;
  }

  // Sweat drop — teardrop on forehead side (15%)
  if (random.bool(0.15)) {
    const sdx = cx + headW * 0.32;
    const sdy = faceTop + 8;
    content += `<path d="M ${sdx} ${sdy - 3} Q ${sdx + 2} ${sdy} ${sdx} ${sdy + 3} Q ${sdx - 2} ${sdy} ${sdx} ${sdy - 3} Z" fill="#87CEEB" opacity="0.7"/>`;
  }

  // Sparkles — small 4-point stars near face (20%)
  if (random.bool(0.20)) {
    const sx = cx + headW * 0.38;
    const sy = eyeY - eyeRy * 0.5;
    const sr = 1.8;
    content += `<path d="M ${sx} ${sy - sr} L ${sx + sr * 0.3} ${sy - sr * 0.3} L ${sx + sr} ${sy} L ${sx + sr * 0.3} ${sy + sr * 0.3} L ${sx} ${sy + sr} L ${sx - sr * 0.3} ${sy + sr * 0.3} L ${sx - sr} ${sy} L ${sx - sr * 0.3} ${sy - sr * 0.3} Z" fill="#FFD700" opacity="0.6"/>`;
    // Second smaller sparkle
    const s2x = sx - 3;
    const s2y = sy - 3;
    const s2r = 1.1;
    content += `<path d="M ${s2x} ${s2y - s2r} L ${s2x + s2r * 0.3} ${s2y - s2r * 0.3} L ${s2x + s2r} ${s2y} L ${s2x + s2r * 0.3} ${s2y + s2r * 0.3} L ${s2x} ${s2y + s2r} L ${s2x - s2r * 0.3} ${s2y + s2r * 0.3} L ${s2x - s2r} ${s2y} L ${s2x - s2r * 0.3} ${s2y - s2r * 0.3} Z" fill="#FFD700" opacity="0.4"/>`;
  }

  // Anger vein — cross/hash mark on forehead (10%)
  if (random.bool(0.10)) {
    const ax = cx + headW * 0.18;
    const ay = faceTop + 6;
    content += `<path d="M ${ax - 2} ${ay - 1.5} Q ${ax} ${ay} ${ax + 2} ${ay - 1.5} M ${ax - 1.5} ${ay - 2} Q ${ax} ${ay} ${ax - 1.5} ${ay + 2} M ${ax + 1.5} ${ay - 2} Q ${ax} ${ay} ${ax + 1.5} ${ay + 2} M ${ax - 2} ${ay + 1.5} Q ${ax} ${ay} ${ax + 2} ${ay + 1.5}" fill="none" stroke="#CC3333" stroke-width="0.8" opacity="0.7"/>`;
  }

  // Expression lines — parallel diagonal lines near cheek (15%)
  if (random.bool(0.15)) {
    const elx = cx - headW * 0.38;
    const ely = cy + 2;
    content += `<line x1="${elx}" y1="${ely - 2}" x2="${elx - 2}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>`
      + `<line x1="${elx + 1.5}" y1="${ely - 2}" x2="${elx - 0.5}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>`
      + `<line x1="${elx + 3}" y1="${ely - 2}" x2="${elx + 1}" y2="${ely + 2}" stroke="${"#2C1810"}" stroke-width="0.6" opacity="0.3"/>`;
  }

  return content;
}

// ============================================================================
// Accessories
// ============================================================================

function drawAccessories(random: Random, g: AnimeGeo, skinColor: string): string {
  const { cx, cy, headW, headH, faceTop, eyeY, eyeRy } = g;
  let content = "";

  // Bandaid on cheek (5%)
  if (random.bool(0.05)) {
    const bx = cx + headW * 0.22;
    const by = eyeY + eyeRy * 2.5;
    content += `<rect x="${bx - 3}" y="${by - 1}" width="6" height="2.5" rx="0.5" fill="#F5DEB3" stroke="#DEB887" stroke-width="0.3" transform="rotate(-15 ${bx} ${by})"/>`;
  }

  // Headband across forehead (8%)
  if (random.bool(0.08)) {
    const hby = faceTop + 4;
    content += `<path d="M ${cx - headW * 0.48} ${hby + 1} Q ${cx} ${hby - 2} ${cx + headW * 0.48} ${hby + 1}" fill="none" stroke="#CC3333" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
  }

  return content;
}

// ============================================================================
// Ahoge — single upward-pointing hair strand
// ============================================================================

function drawAhoge(g: AnimeGeo, hairColor: string): string {
  const { cx, faceTop } = g;
  const baseY = faceTop - 8;
  return `<path d="M ${cx - 1} ${baseY + 4} Q ${cx - 4} ${baseY - 6} ${cx + 1} ${baseY - 10} Q ${cx + 3} ${baseY - 4} ${cx + 1} ${baseY + 4}" fill="${hairColor}"/>`;
}

// ============================================================================
// Main content builder
// ============================================================================

function createAnimeContent(options: AnimeOptions): string {
  const size = options.size ?? 64;
  const skinTones = options.skinTones ?? SKIN_TONES;
  const eyeColorPalette = options.eyeColors ?? EYE_COLORS;
  const random = createRandom(options.seed);

  const skinColor = random.pick(skinTones);
  const hairColor = random.pick(ANIME_HAIR_COLORS);
  const featureColor = "#2C1810";
  const eyeColor = random.pick(eyeColorPalette);
  const g = computeGeo(size);

  // Pick features
  const hairStyle: HairStyle = (options.hairStyle as HairStyle) ?? random.pick(HAIR_STYLES);
  const eyeStyle: EyeStyle = (options.eyeStyle as EyeStyle) ?? random.pick(EYE_STYLES);
  const mouthStyle: MouthStyle = (options.mouthStyle as MouthStyle) ?? random.pick(MOUTH_STYLES);
  const noseStyle: NoseStyle = (options.noseStyle as NoseStyle) ?? random.pick(NOSE_STYLES);
  const eyebrowStyle: EyebrowStyle = random.pick(EYEBROW_STYLES);

  // Expression / accessory probabilities
  const hasBangs = options.bangs ?? random.bool(0.6);
  const hasAhoge = options.ahoge ?? random.bool(0.4);
  const hasBlush = options.blush ?? random.bool(0.35);
  const enableAccessories = options.accessories !== false;

  let content = "";

  // Render order:
  // 1. Hair behind
  content += drawHairBehind(hairStyle, g, hairColor);

  // 2. Ears
  content += drawEars(g, skinColor);

  // 3. Face (V-chin bezier path)
  content += drawFace(g, skinColor);

  // 4. Hair front (bangs over forehead)
  content += drawHairFront(hairStyle, g, hairColor, hasBangs);

  // 5. Eyebrows
  content += drawEyebrows(eyebrowStyle, g, featureColor);

  // 6. Eyes (the star feature — multi-layer)
  content += drawEyes(eyeStyle, g, featureColor, eyeColor);

  // 7. Nose (minimal)
  content += drawNose(noseStyle, g, featureColor);

  // 8. Mouth (small, lower position)
  content += drawMouth(mouthStyle, g, featureColor);

  // 9. Expressions (blush, sweat-drop, sparkles, etc.)
  content += drawExpressions(random, g, hasBlush);

  // 10. Accessories (bandaid, headband)
  if (enableAccessories) {
    content += drawAccessories(random, g, skinColor);
  }

  // 11. Ahoge (single strand on top)
  if (hasAhoge) {
    content += drawAhoge(g, hairColor);
  }

  return content;
}

/**
 * Anime avatar style
 *
 * Creates anime/manga-inspired face avatars with oversized expressive eyes,
 * V-shaped chin, dramatic spiky hair, and anime-specific expressions
 * (blush, sweat-drop, sparkles, anger-vein).
 * 20,000+ unique variants.
 *
 * @example
 * ```ts
 * import { createAvatar } from '@avatar-generator/core';
 * import { anime } from '@avatar-generator/style-anime';
 *
 * const avatar = createAvatar(anime, {
 *   seed: 'unique-id',
 *   size: 64,
 * });
 * ```
 */
export const anime: Style<AnimeOptions> = {
  name: "anime",

  create(options: AnimeOptions): AvatarResult {
    const random = createRandom(options.seed);
    const colors = options.colors ?? DEFAULT_COLORS;
    const backgroundColor = random.pick(colors);

    const content = createAnimeContent(options);

    return buildSvg(content, options, backgroundColor);
  },
};

export default anime;
export type { AnimeOptions };
