// @vitest-environment happy-dom
import { createAvatar } from "@avatar-generator/core";
import { Avatar } from "@avatar-generator/vue";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

type AvatarProps = InstanceType<typeof Avatar>["$props"];

const mountAvatar = (props: AvatarProps) => mount(Avatar, { props });

describe("<Avatar /> (vue)", () => {
    it("renders an img whose src is the avatar data URI", () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB" } });

        expect(wrapper.get("img").attributes("src")).toBe(createAvatar(initials, { seed: "Hugo GB" }).toDataUri());
    });

    it("renders the same avatar the core API produces for that seed", () => {
        const wrapper = mountAvatar({ style: geometric, options: { seed: "user-42", size: 128 } });

        expect(wrapper.get("img").attributes("src")).toBe(
            createAvatar(geometric, { seed: "user-42", size: 128 }).toDataUri(),
        );
    });

    it('defaults alt to "Avatar" so the image is never unlabelled', () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB" } });

        expect(wrapper.get("img").attributes("alt")).toBe("Avatar");
    });

    it("uses the supplied alt text", () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB" }, alt: "Hugo García" });

        expect(wrapper.get("img").attributes("alt")).toBe("Hugo García");
    });

    it("sizes the element from options.size", () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB", size: 96 } });

        expect(wrapper.get("img").attributes("width")).toBe("96");
        expect(wrapper.get("img").attributes("height")).toBe("96");
    });

    it("falls back to 64px when no size is given", () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB" } });

        expect(wrapper.get("img").attributes("width")).toBe("64");
        expect(wrapper.get("img").attributes("height")).toBe("64");
    });

    it("applies the class prop", () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "Hugo GB" }, class: "rounded" });

        expect(wrapper.get("img").classes()).toContain("rounded");
    });

    it("re-renders when the seed changes", async () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "first" } });
        const before = wrapper.get("img").attributes("src");

        await wrapper.setProps({ options: { seed: "second" } });

        expect(wrapper.get("img").attributes("src")).not.toBe(before);
        expect(wrapper.get("img").attributes("src")).toBe(createAvatar(initials, { seed: "second" }).toDataUri());
    });

    it("re-renders when the style changes", async () => {
        const wrapper = mountAvatar({ style: initials, options: { seed: "same-seed" } });
        const before = wrapper.get("img").attributes("src");

        await wrapper.setProps({ style: geometric });

        expect(wrapper.get("img").attributes("src")).not.toBe(before);
    });

    it("renders the same output for the same seed across separate mounts", () => {
        const first = mountAvatar({ style: initials, options: { seed: "stable" } });
        const src = first.get("img").attributes("src");
        first.unmount();

        const second = mountAvatar({ style: initials, options: { seed: "stable" } });

        expect(second.get("img").attributes("src")).toBe(src);
    });
});
