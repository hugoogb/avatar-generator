// @vitest-environment happy-dom
import { createAvatar, type AvatarOptions } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import type { SimpleChanges } from "@angular/core";
import { describe, expect, it } from "vitest";
import { AvatarComponent, AvatarModule } from "@avatar-generator/angular";

/**
 * The component is exercised directly rather than through TestBed: its whole
 * job is to turn inputs into `dataUri` and `size` inside `ngOnChanges`, and
 * that is testable without booting the Angular compiler and zone.js. The
 * template binding itself (`[src]`, `[width]`) is one line of Angular's own
 * responsibility.
 */
const changed = (): SimpleChanges => ({}) as SimpleChanges;

const mount = (style: AvatarComponent<AvatarOptions>["style"], options: AvatarOptions) => {
    const component = new AvatarComponent<AvatarOptions>();
    component.style = style;
    component.options = options;
    component.ngOnChanges(changed());
    return component;
};

describe("AvatarComponent (angular)", () => {
    it("produces the data URI the core API produces for that seed", () => {
        const component = mount(initials, { seed: "Hugo GB" });

        expect(component.dataUri).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("produces a data URI for a different style", () => {
        const component = mount(geometric, { seed: "user-42", size: 128 });

        expect(component.dataUri).toBe(createAvatar(geometric, { seed: "user-42", size: 128 }).toDataUri());
    });

    it('defaults alt to "Avatar" so the image is never unlabelled', () => {
        expect(new AvatarComponent().alt).toBe("Avatar");
    });

    it("takes size from options", () => {
        expect(mount(initials, { seed: "Hugo GB", size: 96 }).size).toBe(96);
    });

    it("falls back to 64px when no size is given", () => {
        expect(mount(initials, { seed: "Hugo GB" }).size).toBe(64);
    });

    it("renders nothing before both inputs are set", () => {
        const component = new AvatarComponent<AvatarOptions>();
        component.ngOnChanges(changed());

        expect(component.dataUri).toBe("");
    });

    it("stays empty when only the style is set", () => {
        const component = new AvatarComponent<AvatarOptions>();
        component.style = initials;
        component.ngOnChanges(changed());

        expect(component.dataUri).toBe("");
    });

    it("re-renders when the seed changes", () => {
        const component = mount(initials, { seed: "first" });
        const before = component.dataUri;

        component.options = { seed: "second" };
        component.ngOnChanges(changed());

        expect(component.dataUri).not.toBe(before);
        expect(component.dataUri).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("re-renders when the style changes", () => {
        const component = mount(initials, { seed: "same-seed" });
        const before = component.dataUri;

        component.style = geometric;
        component.ngOnChanges(changed());

        expect(component.dataUri).not.toBe(before);
    });

    it("produces the same output for the same seed across instances", () => {
        expect(mount(initials, { seed: "stable" }).dataUri).toBe(mount(initials, { seed: "stable" }).dataUri);
    });

    it("exports the component through AvatarModule", () => {
        expect(AvatarModule).toBeDefined();
        expect(AvatarComponent).toBeDefined();
    });
});
