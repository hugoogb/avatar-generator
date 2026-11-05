import { hashSeed } from "./random";
import type { AvatarOptions, IdleAnimation } from "./types";

const CYCLE_MS = 5000;

const RULES: Record<IdleAnimation, string> = {
    breathe:
        ".ag-breathe .ag-content{transform-box:view-box;transform-origin:center;" +
        `animation:ag-breathe ${CYCLE_MS}ms ease-in-out var(--ag-delay,0s) infinite}` +
        "@keyframes ag-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}",
    blink:
        ".ag-blink .ag-layer-eyes{transform-box:fill-box;transform-origin:center;" +
        `animation:ag-blink ${CYCLE_MS}ms linear var(--ag-delay,0s) infinite}` +
        "@keyframes ag-blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}",
};

/** Normalises the `animation` option into one flag per animation. */
export function resolveAnimations(options: Pick<AvatarOptions, "animation">): Record<IdleAnimation, boolean> {
    const { animation } = options;
    if (animation === true) return { blink: true, breathe: true };
    if (!animation) return { blink: false, breathe: false };

    const requested = Array.isArray(animation) ? animation : [animation];
    for (const name of requested) {
        if (!(name in RULES)) {
            const valid = Object.keys(RULES)
                .map((key) => JSON.stringify(key))
                .join(", ");
            throw new Error(
                `[@avatar-generator/core] Invalid animation: ${JSON.stringify(name)}. Expected one of: ${valid}.`,
            );
        }
    }
    return { blink: requested.includes("blink"), breathe: requested.includes("breathe") };
}

/**
 * The stylesheet for a set of animations. Everything sits inside a
 * `prefers-reduced-motion` query. That is enough for inlined SVG, but not inside
 * `<img>`, where browsers may not report the setting: see `adaptForImage`.
 * Rules are scoped under a root class, because an inlined SVG's `<style>`
 * applies to the whole page.
 */
export function animationCss(animations: Record<IdleAnimation, boolean>): string {
    const rules = (Object.keys(RULES) as IdleAnimation[]).filter((name) => animations[name]).map((name) => RULES[name]);
    return `@media (prefers-reduced-motion:no-preference){${rules.join("")}}`;
}

/**
 * A delay derived from the seed, so a page of avatars does not blink in unison
 * while the output stays deterministic.
 */
export function animationRootAttributes(seed: string): string {
    return ` style="--ag-delay:-${hashSeed(seed) % CYCLE_MS}ms"`;
}
