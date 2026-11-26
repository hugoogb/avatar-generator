// @vitest-environment happy-dom
import { createAvatar } from "@avatar-generator/core";
import { faces } from "@avatar-generator/style-faces";
import { describe, expect, it } from "vitest";
import * as bundle from "../src/global";

describe("browser bundle entry", () => {
    it("registers every built-in style for the avatar-style attribute", () => {
        expect(Object.keys(bundle.styles)).toHaveLength(11);
        for (const name of Object.keys(bundle.styles)) {
            document.body.innerHTML = `<avatar-generator avatar-style="${name}" seed="x"></avatar-generator>`;
            const src = document.body.firstElementChild?.shadowRoot?.querySelector("img")?.getAttribute("src");
            expect(src, name).toMatch(/^data:image\/svg\+xml/);
        }
    });

    it("exposes core alongside the elements", () => {
        expect(bundle.createAvatar(faces, { seed: "x" }).toString()).toBe(
            createAvatar(faces, { seed: "x" }).toString(),
        );
        expect(typeof bundle.registerStyle).toBe("function");
    });
});
