// @vitest-environment happy-dom
import { act, cleanup, render } from "@testing-library/react";
import { createAvatar, createAvatarGroup } from "@avatar-generator/core";
import { initials } from "@avatar-generator/style-initials";
import { geometric } from "@avatar-generator/style-geometric";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Avatar, AvatarGroup } from "@avatar-generator/react-native";

/**
 * react-native and react-native-svg ship Flow and native code that Node cannot
 * load, so both are replaced. The SvgXml stand-in records the props it gets,
 * which is the whole contract between this package and react-native-svg.
 */
const native = vi.hoisted(() => ({
    os: "ios" as string,
    colorScheme: "light" as "light" | "dark" | null,
    contrast: false,
    listeners: new Map<string, Set<(enabled: boolean) => void>>(),
    svgProps: [] as Record<string, unknown>[],
}));

vi.mock("react-native", () => {
    const subscribe = (event: string, listener: (enabled: boolean) => void) => {
        const set = native.listeners.get(event) ?? new Set();
        set.add(listener);
        native.listeners.set(event, set);
        return { remove: () => set.delete(listener) };
    };
    return {
        Platform: {
            get OS() {
                return native.os;
            },
        },
        useColorScheme: () => native.colorScheme,
        AccessibilityInfo: {
            isDarkerSystemColorsEnabled: () => Promise.resolve(native.os === "ios" && native.contrast),
            isHighTextContrastEnabled: () => Promise.resolve(native.os === "android" && native.contrast),
            addEventListener: subscribe,
        },
    };
});

vi.mock("react-native-svg", () => ({
    SvgXml: (props: Record<string, unknown>) => {
        native.svgProps.push(props);
        return null;
    },
}));

/** Core output as this package hands it to react-native-svg. */
const asNative = (svg: string) => svg.replace(/dominant-baseline=/g, "alignment-baseline=");

const lastSvg = () => native.svgProps[native.svgProps.length - 1];

/** Lets the contrast setting's promise resolve and re-render. */
const settle = () => act(() => Promise.resolve());

const emit = (event: string, enabled: boolean) =>
    act(() => {
        for (const listener of native.listeners.get(event) ?? []) listener(enabled);
    });

beforeEach(() => {
    native.os = "ios";
    native.colorScheme = "light";
    native.contrast = false;
    native.listeners.clear();
    native.svgProps = [];
});
afterEach(cleanup);

describe("<Avatar /> (react-native)", () => {
    it("renders the SVG the core API produces for that seed", () => {
        render(<Avatar style={geometric} options={{ seed: "user-42", size: 128 }} />);

        expect(lastSvg().xml).toBe(asNative(createAvatar(geometric, { seed: "user-42", size: 128 }).svg));
    });

    it("sizes the view from options.size, falling back to 64", () => {
        render(<Avatar style={initials} options={{ seed: "a", size: 96 }} />);
        expect(lastSvg()).toMatchObject({ width: 96, height: 96 });

        render(<Avatar style={initials} options={{ seed: "a" }} />);
        expect(lastSvg()).toMatchObject({ width: 64, height: 64 });
    });

    it("centres text with alignment-baseline, which react-native-svg implements", () => {
        render(<Avatar style={initials} options={{ seed: "Hugo GB" }} />);
        const xml = lastSvg().xml as string;

        expect(xml).toContain('alignment-baseline="central"');
        expect(xml).not.toContain("dominant-baseline");
    });

    it('labels the image, defaulting to "Avatar"', () => {
        render(<Avatar style={initials} options={{ seed: "a" }} />);
        expect(lastSvg()).toMatchObject({ accessible: true, accessibilityRole: "image", accessibilityLabel: "Avatar" });

        render(<Avatar style={initials} options={{ seed: "a" }} alt="Hugo García" />);
        expect(lastSvg().accessibilityLabel).toBe("Hugo García");
    });

    it('hides the image from screen readers when alt is ""', () => {
        render(<Avatar style={initials} options={{ seed: "a" }} alt="" />);

        expect(lastSvg()).toMatchObject({ accessible: false, importantForAccessibility: "no-hide-descendants" });
        expect(lastSvg().accessibilityLabel).toBeUndefined();
    });

    it("passes containerStyle and testID through", () => {
        const containerStyle = { borderRadius: 8 };
        render(<Avatar style={initials} options={{ seed: "a" }} containerStyle={containerStyle} testID="me" />);

        expect(lastSvg()).toMatchObject({ style: containerStyle, testID: "me" });
    });

    it("re-renders when the seed changes", () => {
        const { rerender } = render(<Avatar style={initials} options={{ seed: "first" }} />);
        rerender(<Avatar style={initials} options={{ seed: "second" }} />);

        expect(lastSvg().xml).toBe(asNative(createAvatar(initials, { seed: "second" }).svg));
    });

    it("never animates, because react-native-svg ignores <style>", () => {
        render(<Avatar style={initials} options={{ seed: "x", animation: true }} />);

        expect(lastSvg().xml).toBe(asNative(createAvatar(initials, { seed: "x" }).svg));
        expect(lastSvg().xml).not.toContain("<style");
    });
});

describe('theme: "auto" (react-native)', () => {
    const auto = { seed: "x", theme: "auto" } as const;
    const themed = (theme: "light" | "dark" | "high-contrast") =>
        asNative(createAvatar(initials, { seed: "x", theme }).svg);

    it("follows the device colour scheme", () => {
        native.colorScheme = "dark";
        render(<Avatar style={initials} options={auto} />);
        expect(lastSvg().xml).toBe(themed("dark"));
    });

    it("uses light when the scheme is unknown", () => {
        native.colorScheme = null;
        render(<Avatar style={initials} options={auto} />);
        expect(lastSvg().xml).toBe(themed("light"));
    });

    it("switches when the scheme changes", () => {
        const { rerender } = render(<Avatar style={initials} options={auto} />);
        native.colorScheme = "dark";
        rerender(<Avatar style={initials} options={auto} />);
        expect(lastSvg().xml).toBe(themed("dark"));
    });

    it.each(["ios", "android"])("uses high contrast when %s asks for more contrast, over dark", async (os) => {
        native.os = os;
        native.colorScheme = "dark";
        native.contrast = true;
        render(<Avatar style={initials} options={auto} />);
        await settle();

        expect(lastSvg().xml).toBe(themed("high-contrast"));
    });

    it("follows the contrast setting as it changes", async () => {
        render(<Avatar style={initials} options={auto} />);
        await settle();
        expect(lastSvg().xml).toBe(themed("light"));

        emit("darkerSystemColorsChanged", true);
        expect(lastSvg().xml).toBe(themed("high-contrast"));
    });

    it("stops listening on unmount", () => {
        const { unmount } = render(<Avatar style={initials} options={auto} />);
        expect(native.listeners.get("darkerSystemColorsChanged")?.size).toBe(1);

        unmount();
        expect(native.listeners.get("darkerSystemColorsChanged")?.size).toBe(0);
    });

    it("leaves an explicit theme alone", async () => {
        native.colorScheme = "dark";
        native.contrast = true;
        render(<Avatar style={initials} options={{ seed: "x", theme: "light" }} />);
        await settle();

        expect(lastSvg().xml).toBe(themed("light"));
    });
});

describe("<AvatarGroup /> (react-native)", () => {
    const seeds = ["ana", "ben", "chi", "dee"];

    it("renders the group the core API produces, sized to fit", () => {
        render(<AvatarGroup style={geometric} items={seeds} options={{ size: 40 }} />);
        const group = createAvatarGroup(geometric, seeds, { size: 40 });

        expect(lastSvg()).toMatchObject({ xml: asNative(group.svg), width: group.width, height: group.height });
    });

    it("centres the +N badge text with alignment-baseline", () => {
        render(<AvatarGroup style={geometric} items={seeds} options={{ max: 2 }} />);
        expect(lastSvg().xml).toContain('alignment-baseline="central"');
        expect(lastSvg().xml).not.toContain("dominant-baseline");
    });

    it("defaults the label to the group's count, and accepts alt", () => {
        render(<AvatarGroup style={initials} items={seeds} />);
        expect(lastSvg().accessibilityLabel).toBe("4 avatars");

        render(<AvatarGroup style={initials} items={seeds} alt="Project team" />);
        expect(lastSvg().accessibilityLabel).toBe("Project team");
    });

    it("resolves the auto theme and drops animation for every member", () => {
        native.colorScheme = "dark";
        render(
            <AvatarGroup
                style={initials}
                items={["a", { seed: "b", animation: true }]}
                options={{ options: { theme: "auto", animation: true } }}
            />,
        );

        expect(lastSvg().xml).toBe(
            asNative(createAvatarGroup(initials, ["a", { seed: "b" }], { options: { theme: "dark" } }).svg),
        );
    });
});
