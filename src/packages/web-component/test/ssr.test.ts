// @vitest-environment node
//
// Deliberately no DOM. This file exists to prove the package can be imported
// from a server render — Next.js, Nuxt, Astro, SvelteKit — where `HTMLElement`
// and `customElements` do not exist. It used to throw `ReferenceError:
// HTMLElement is not defined` on import, before any consumer code ran.
import { describe, expect, it } from "vitest";
import { AvatarElement, register } from "@avatar-generator/web-component";

describe("web component under SSR", () => {
    it("has no DOM in this environment", () => {
        expect(typeof HTMLElement).toBe("undefined");
        expect(typeof customElements).toBe("undefined");
    });

    it("imports without throwing", () => {
        // Reaching this line at all is the assertion: a throwing module body
        // would have failed the whole file at import time.
        expect(AvatarElement).toBeDefined();
        expect(typeof AvatarElement).toBe("function");
    });

    it("register() is a no-op instead of throwing", () => {
        expect(() => register()).not.toThrow();
        expect(() => register("my-avatar")).not.toThrow();
    });

    it("still exports a class that can be referenced and subclassed", () => {
        expect(() => class extends AvatarElement {}).not.toThrow();
    });
});
