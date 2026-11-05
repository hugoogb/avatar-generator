import { describe, expect, it } from "vitest";
import {
    adaptForImage,
    adaptGroupForImage,
    animationCss,
    createAvatar,
    createAvatarGroup,
    createAvatarTransition,
    DARK_THEME,
    defineStyle,
    defineTheme,
    HIGH_CONTRAST_THEME,
    LIGHT_THEME,
    mixStyles,
    NO_PREFERENCES,
    renderToString,
    resolveAnimations,
    resolveTheme,
    scopeSvgIds,
    subscribeViewerPreferences,
    svgToDataUri,
    viewerPreferences,
    type AvatarOptions,
} from "@avatar-generator/core";

const decode = (uri: string) => {
    const bytes = Uint8Array.from(atob(uri.split(",")[1]), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
};

const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

const painter = defineStyle<AvatarOptions & { tone?: string }, { tone: string }>({
    name: "painter",
    prepare: (options, random) => ({ tone: options.tone ?? random.pick(["a", "b", "c", "d", "e"]) }),
    layers: [
        { name: "back", feature: "body", render: ({ traits }) => `<i id="back-${traits.tone}"/>` },
        { name: "eyes", render: ({ traits, random }) => `<i id="eyes-${traits.tone}-${random.int(0, 1e6)}"/>` },
        { name: "front", feature: "body", render: ({ traits }) => `<i id="front-${traits.tone}"/>` },
    ],
});

const donor = defineStyle<AvatarOptions & { shade?: string }, string>({
    name: "donor",
    prepare: (options) => options.shade ?? "plain",
    validate: (options) => {
        if (options.shade === "bad") throw new Error("bad shade");
    },
    layers: [
        { name: "back", feature: "body", render: ({ traits }) => `<b id="donor-back-${traits}"/>` },
        { name: "eyes", render: ({ traits }) => `<b id="donor-eyes-${traits}"/>` },
        { name: "hat", render: ({ traits }) => `<b id="donor-hat-${traits}"/>` },
    ],
});

describe("data URIs", () => {
    it.each(["李小龙", "José", "🙂"])("round-trips %s through UTF-8", (text) => {
        const svg = `<svg><title>${text}</title></svg>`;
        expect(decode(svgToDataUri(svg))).toBe(svg);
    });

    it("leaves ASCII output identical to plain btoa", () => {
        const svg = '<svg width="1"/>';
        expect(svgToDataUri(svg)).toBe(`data:image/svg+xml;base64,${btoa(svg)}`);
    });
});

describe("defineStyle", () => {
    it("works with createAvatar and is deterministic", () => {
        const a = createAvatar(painter, { seed: "x" }).svg;
        expect(a).toBe(createAvatar(painter, { seed: "x" }).svg);
        expect(a).toContain('id="back-');
    });

    it("paints layers in order", () => {
        const { svg } = createAvatar(painter, { seed: "x" });
        expect(svg.indexOf("back-")).toBeLessThan(svg.indexOf("eyes-"));
        expect(svg.indexOf("eyes-")).toBeLessThan(svg.indexOf("front-"));
    });

    it("gives each layer a generator unaffected by other layers", () => {
        const eyesDraw = (svg: string) => /eyes-\w-(\d+)/.exec(svg)?.[1];
        const withExtra = defineStyle({
            name: "extra",
            prepare: painter.prepare,
            layers: [{ name: "noise", render: ({ random }) => `<i n="${random.next()}"/>` }, ...painter.layers],
        });
        expect(eyesDraw(createAvatar(withExtra, { seed: "x" }).svg)).toBe(
            eyesDraw(createAvatar(painter, { seed: "x" }).svg),
        );
    });

    it("rejects duplicate layer names", () => {
        const render = () => "";
        expect(() =>
            defineStyle({
                name: "dupe",
                layers: [
                    { name: "a", render },
                    { name: "a", render },
                ],
            }),
        ).toThrow(/two layers named "a"/);
    });

    it("runs validate before drawing", () => {
        expect(() => createAvatar(donor, { seed: "x", shade: "bad" })).toThrow("bad shade");
    });
});

describe("mixStyles", () => {
    it("takes a feature from a donor, in the base's paint position", () => {
        const { svg } = createAvatar(mixStyles(painter, { eyes: donor }), { seed: "x" });
        expect(svg).toContain("donor-eyes-plain");
        expect(svg).not.toMatch(/id="eyes-/);
        expect(svg.indexOf("donor-eyes")).toBeLessThan(svg.indexOf('id="front-'));
    });

    it("leaves other features exactly as the seed picked them", () => {
        const plain = createAvatar(painter, { seed: "x" }).svg;
        const mixed = createAvatar(mixStyles(painter, { eyes: donor }), { seed: "x" }).svg;
        const back = /id="back-\w"/.exec(plain)?.[0];
        expect(mixed).toContain(back);
    });

    it("drops base layers of a feature the donor has no slot for", () => {
        const { svg } = createAvatar(mixStyles(painter, { body: donor }), { seed: "x" });
        expect(svg).toContain("donor-back");
        expect(svg).not.toMatch(/id="front-/);
    });

    it("adds a feature the base lacks", () => {
        const { svg } = createAvatar(mixStyles(painter, { hat: donor }), { seed: "x" });
        expect(svg).toContain("donor-hat-plain");
    });

    it("passes donor options only to that donor", () => {
        const mixed = mixStyles(painter, { eyes: { style: donor, options: { shade: "dark" } } });
        expect(createAvatar(mixed, { seed: "x" }).svg).toContain("donor-eyes-dark");
    });

    it("does not leak the base's own options into a donor", () => {
        const mixed = mixStyles(painter, { eyes: donor });
        const { svg } = createAvatar(mixed, { seed: "x", tone: "z", shade: "bad" } as AvatarOptions);
        expect(svg).toContain("donor-eyes-plain");
    });

    it("validates donor options", () => {
        const mixed = mixStyles(painter, { eyes: { style: donor, options: { shade: "bad" } } });
        expect(() => createAvatar(mixed, { seed: "x" })).toThrow("bad shade");
    });

    it("overrides a feature with a function that sees the base's traits", () => {
        const mixed = mixStyles(painter, {
            eyes: ({ traits }) => `<u id="own-${(traits as { tone: string }).tone}"/>`,
        });
        const tone = /id="back-(\w)"/.exec(createAvatar(painter, { seed: "x" }).svg)?.[1];
        expect(createAvatar(mixed, { seed: "x" }).svg).toContain(`own-${tone}`);
    });

    it("replaces a multi-layer feature with one function, once", () => {
        const mixed = mixStyles(painter, { body: () => `<u id="one"/>` });
        expect(createAvatar(mixed, { seed: "x" }).svg.match(/id="one"/g)).toHaveLength(1);
    });

    it("removes a feature with null", () => {
        const { svg } = createAvatar(mixStyles(painter, { body: null }), { seed: "x" });
        expect(svg).not.toMatch(/back-|front-/);
    });

    it("can be mixed again", () => {
        const twice = mixStyles(mixStyles(painter, { eyes: donor }), { hat: donor });
        const { svg } = createAvatar(twice, { seed: "x" });
        expect(svg).toContain("donor-eyes");
        expect(svg).toContain("donor-hat");
    });

    it("names unknown features and what exists", () => {
        expect(() => mixStyles(painter, { wings: () => "" })).toThrow(/no such feature.*body, eyes/);
        expect(() => mixStyles(painter, { wings: donor })).toThrow(/"donor".*body, eyes, hat/);
    });

    it("keeps no state between renders", () => {
        const mixed = mixStyles(painter, { eyes: donor });
        const first = createAvatar(mixed, { seed: "a" }).svg;
        createAvatar(mixed, { seed: "b" });
        expect(createAvatar(mixed, { seed: "a" }).svg).toBe(first);
    });
});

describe("animation", () => {
    const plain = createAvatar(painter, { seed: "x" }).svg;

    it("adds nothing unless asked", () => {
        expect(plain).not.toMatch(/<style|class=|ag-/);
    });

    it("normalises the option", () => {
        expect(resolveAnimations({ animation: true })).toEqual({ blink: true, breathe: true });
        expect(resolveAnimations({ animation: "blink" })).toEqual({ blink: true, breathe: false });
        expect(resolveAnimations({ animation: ["breathe"] })).toEqual({ blink: false, breathe: true });
        expect(resolveAnimations({})).toEqual({ blink: false, breathe: false });
    });

    it("rejects an unknown animation", () => {
        expect(() => createAvatar(painter, { seed: "x", animation: "wiggle" as "blink" })).toThrow(/Invalid animation/);
    });

    it("gates all motion behind prefers-reduced-motion", () => {
        const css = animationCss({ blink: true, breathe: true });
        expect(css.startsWith("@media (prefers-reduced-motion:no-preference){")).toBe(true);
        expect(css.endsWith("}")).toBe(true);
        expect(css.replace(/@media \(prefers-reduced-motion:no-preference\)\{/, "")).not.toMatch(/@media/);
    });

    it("groups the eyes so that blink can reach them", () => {
        const { svg } = createAvatar(painter, { seed: "x", animation: "blink" });
        expect(svg).toMatch(/<svg[^>]*class="ag-blink"/);
        expect(svg).toMatch(/<g class="ag-layer ag-layer-eyes"><i id="eyes-/);
    });

    it("stays deterministic and desynchronises by seed", () => {
        const delay = (seed: string) =>
            /--ag-delay:(-\d+ms)/.exec(createAvatar(painter, { seed, animation: true }).svg)?.[1];
        expect(delay("a")).toBe(delay("a"));
        expect(new Set(["a", "b", "c", "d", "e"].map(delay)).size).toBeGreaterThan(1);
    });
});

describe("classes", () => {
    it("adds stable hooks and a custom class, escaped", () => {
        const { svg } = createAvatar(painter, { seed: "x", classes: 'mine"><script>' });
        expect(svg).toMatch(/class="ag-avatar mine&quot;&gt;&lt;script&gt;"/);
        expect(svg).toContain('class="ag-content"');
        expect(svg).toContain("ag-layer-eyes");
        expect(svg).not.toContain("<script>");
    });
});

describe("accessibility", () => {
    it("adds an escaped accessible name and description", () => {
        const { svg } = createAvatar(painter, { seed: "x", title: 'A <b> "name"', description: "Longer & text" });
        expect(svg).toMatch(/^<svg[^>]* role="img" aria-label="A &lt;b&gt; &quot;name&quot;"/);
        expect(svg).toContain("<title>A &lt;b&gt; &quot;name&quot;</title>");
        expect(svg).toContain("<desc>Longer &amp; text</desc>");
    });

    it("produces a usable data URI for a non-Latin title", () => {
        const result = createAvatar(painter, { seed: "x", title: "李小龙" });
        expect(decode(result.toDataUri())).toContain("<title>李小龙</title>");
    });
});

describe("themes", () => {
    it("resolves names and rejects unknown ones", () => {
        expect(resolveTheme("dark")).toBe(DARK_THEME);
        expect(resolveTheme(undefined)).toBeUndefined();
        expect(() => resolveTheme("neon" as "dark")).toThrow(/Invalid theme.*"light", "dark", "high-contrast", "auto"/);
    });

    it("keeps palettes the same length, so a seed keeps its slot across themes", () => {
        expect(DARK_THEME.colors).toHaveLength(LIGHT_THEME.colors.length);
        expect(HIGH_CONTRAST_THEME.colors).toHaveLength(LIGHT_THEME.colors.length);
    });

    it.each([
        ["light", LIGHT_THEME, 4.5],
        ["dark", DARK_THEME, 4.5],
        ["high-contrast", HIGH_CONTRAST_THEME, 7],
    ])("%s foreground clears %s against every background", (_name, theme, ratio) => {
        for (const color of theme.colors) {
            expect(contrast(color, theme.foreground as string)).toBeGreaterThanOrEqual(ratio as number);
        }
    });

    it("applies the palette, and an explicit palette wins", () => {
        const fill = (options: Partial<AvatarOptions>) =>
            /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(createAvatar(painter, { seed: "x", ...options }).svg)?.[1];
        expect(DARK_THEME.colors).toContain(fill({ theme: "dark" }));
        expect(fill({ theme: "dark", colors: ["#123456"] })).toBe("#123456");
    });

    it("picks the same palette slot in light and dark", () => {
        for (const seed of ["a", "b", "c", "d"]) {
            const slot = (theme: "light" | "dark") => {
                const fill = /<rect x="0" y="0"[^>]*fill="([^"]+)"/.exec(
                    createAvatar(painter, { seed, theme }).svg,
                )?.[1];
                return (theme === "light" ? LIGHT_THEME : DARK_THEME).colors.indexOf(fill as string);
            };
            expect(slot("light")).toBe(slot("dark"));
        }
    });

    it("gives the high-contrast theme a border, which an explicit one overrides", () => {
        expect(createAvatar(painter, { seed: "x", theme: "high-contrast" }).svg).toContain('stroke="#FFFFFF"');
        expect(
            createAvatar(painter, { seed: "x", theme: "high-contrast", border: { width: 1, color: "#ABCDEF" } }).svg,
        ).toContain('stroke="#ABCDEF"');
    });

    it("accepts a custom theme and rejects an empty palette", () => {
        const theme = defineTheme({ name: "brand", colors: ["#0B3D91"] });
        expect(createAvatar(painter, { seed: "x", theme }).svg).toContain("#0B3D91");
        expect(() => defineTheme({ name: "none", colors: [] })).toThrow(/at least one colour/);
    });

    describe("auto", () => {
        const { svg } = createAvatar(painter, { seed: "x", theme: "auto", title: "Ana" });

        it("carries a drawing per theme, switched by media queries", () => {
            for (const name of ["ag-theme-light", "ag-theme-dark", "ag-theme-contrast"]) {
                expect(svg).toContain(`<g class="${name}"><svg`);
            }
            expect(svg).toContain("prefers-color-scheme:dark");
            expect(svg).toContain("prefers-contrast:more");
        });

        it("lets contrast win over colour scheme", () => {
            expect(svg.indexOf("prefers-color-scheme")).toBeLessThan(svg.indexOf("prefers-contrast"));
        });

        it("keeps ids unique across the drawings", () => {
            const ids = [...svg.matchAll(/\bid="(ag-theme[^"]+)"/g)].map((m) => m[1]);
            expect(ids.length).toBeGreaterThan(0);
            expect(new Set(ids.filter((id) => id.includes("clip"))).size).toBe(3);
        });

        it("labels only the outer document", () => {
            expect(svg.match(/<title>/g)).toHaveLength(1);
        });
    });
});

describe("scopeSvgIds", () => {
    it("prefixes ids and every kind of reference", () => {
        const svg = `<clipPath id="c"/><g clip-path="url(#c)"/><use href="#c"/>`;
        expect(scopeSvgIds(svg, "p")).toBe(`<clipPath id="p-c"/><g clip-path="url(#p-c)"/><use href="#p-c"/>`);
    });
});

describe("createAvatarGroup", () => {
    const seeds = ["a", "b", "c", "d", "e"];

    it("nests one avatar per item, with unique ids", () => {
        const { svg } = createAvatarGroup(painter, seeds, { size: 40 });
        expect(svg.match(/<svg /g)).toHaveLength(6);
        const clips = [...svg.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1]);
        expect(new Set(clips).size).toBe(5);
    });

    it("computes the size from the overlap and ring", () => {
        const group = createAvatarGroup(painter, ["a", "b", "c"], { size: 40, overlap: 0.25, ringWidth: 2 });
        expect(group.height).toBe(44);
        expect(group.width).toBe(44 + 30 * 2);
    });

    it("shows a badge past max", () => {
        const { svg } = createAvatarGroup(painter, seeds, { max: 2 });
        expect(svg).toContain(">+3</text>");
        expect(svg.match(/<svg /g)).toHaveLength(3);
    });

    it("shows no badge when everything fits", () => {
        expect(createAvatarGroup(painter, seeds, { max: 5 }).svg).not.toContain("<text");
    });

    it("labels with a count by default rather than seeds, which may be private", () => {
        const group = createAvatarGroup(painter, ["ana@example.com"]);
        expect(group.label).toBe("1 avatar");
        expect(group.svg).not.toContain('aria-label="ana@example.com"');
    });

    it("uses and escapes an explicit title", () => {
        const group = createAvatarGroup(painter, seeds, { title: "Ana & co" });
        expect(group.label).toBe("Ana & co");
        expect(group.svg).toContain('aria-label="Ana &amp; co"');
        expect(group.svg).toContain("<title>Ana &amp; co</title>");
    });

    it("lets an item's options beat the shared ones", () => {
        const { svg } = createAvatarGroup(painter, [{ seed: "a", colors: ["#111111"] }], {
            options: { colors: ["#222222"] },
        });
        expect(svg).toContain("#111111");
        expect(svg).not.toContain("#222222");
    });

    it("rejects a nonsensical overlap or max", () => {
        expect(() => createAvatarGroup(painter, seeds, { overlap: 1 })).toThrow(/overlap/);
        expect(() => createAvatarGroup(painter, seeds, { max: 0 })).toThrow(/max/);
    });

    it("handles an empty group", () => {
        const group = createAvatarGroup(painter, []);
        expect(group.width).toBe(0);
        expect(group.label).toBe("0 avatars");
    });

    it("draws no ring at width zero", () => {
        expect(createAvatarGroup(painter, ["a"], { ringWidth: 0, ringColor: "#ABCDEF" }).svg).not.toContain("#ABCDEF");
    });
});

describe("createAvatarTransition", () => {
    const { svg, toDataUri } = createAvatarTransition(painter, { seed: "a" }, { seed: "b" }, { duration: 250 });

    it("contains both avatars, with unique ids", () => {
        expect(svg).toContain('<g class="ag-transition-from"><svg');
        expect(svg).toContain('<g class="ag-transition-to"><svg');
        const clips = [...svg.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1]);
        expect(new Set(clips).size).toBe(2);
    });

    it("applies the duration", () => {
        expect(svg).toContain("ag-fade-in 250ms");
    });

    it("rests on the target when motion is off", () => {
        const motion = svg.indexOf("@media (prefers-reduced-motion:no-preference)");
        expect(svg.indexOf(".ag-transition-from{opacity:0}")).toBeLessThan(motion);
    });

    it("produces a data URI", () => {
        expect(decode(toDataUri())).toBe(svg);
    });

    it("rejects mismatched sizes and bad timing", () => {
        expect(() => createAvatarTransition(painter, { seed: "a", size: 32 }, { seed: "b", size: 64 })).toThrow(
            /one size/,
        );
        expect(() => createAvatarTransition(painter, { seed: "a" }, { seed: "b" }, { duration: 0 })).toThrow(
            /positive/,
        );
        expect(() =>
            createAvatarTransition(painter, { seed: "a" }, { seed: "b" }, { easing: "x}</style><script>" }),
        ).toThrow(/easing/);
    });
});

describe("renderToString", () => {
    it("emits an img by default, in plain ASCII, with no raw markup in the URI", () => {
        const html = renderToString(painter, { seed: "x", size: 48 }, { alt: "Ana", loading: "lazy" });
        expect(html).toMatch(/^<img src="data:image\/svg\+xml,/);
        expect(html).toMatch(/alt="Ana" width="48" height="48" loading="lazy">$/);
        const src = /src="([^"]+)"/.exec(html)?.[1] as string;
        expect(src).not.toMatch(/[<>#&]/);
    });

    it("emits a URI that decodes back to the avatar", () => {
        const options = { seed: "x", title: "José & 李" };
        const html = renderToString(painter, options);
        const src = /src="([^"]+)"/.exec(html)?.[1] as string;
        const { svg } = createAvatar(painter, options);
        expect(decodeURIComponent(src.split(",").slice(1).join(","))).toBe(svg.replace(/"/g, "'"));
    });

    it("escapes alt and class", () => {
        const html = renderToString(painter, { seed: "x" }, { alt: '"><script>', className: '"bad' });
        expect(html).not.toContain("<script>");
        expect(html).toContain('class="&quot;bad"');
    });

    it("needs no DOM", () => {
        expect(typeof document).toBe("undefined");
        expect(renderToString(painter, { seed: "x" }, { mode: "inline" })).toMatch(/^<svg/);
    });

    describe("inline", () => {
        it("labels the avatar, or hides it when decorative", () => {
            expect(renderToString(painter, { seed: "x" }, { mode: "inline", alt: "Ana" })).toContain(
                'role="img" aria-label="Ana"',
            );
            expect(renderToString(painter, { seed: "x" }, { mode: "inline", alt: "" })).toContain('aria-hidden="true"');
        });

        it("never duplicates attributes when the options set a title", () => {
            const html = renderToString(painter, { seed: "x", title: "Inner" }, { mode: "inline", alt: "Outer" });
            expect(html.match(/aria-label=/g)).toHaveLength(1);
            expect(html).toContain('aria-label="Outer"');
        });

        it("is stable between renders, as hydration needs", () => {
            const render = () => renderToString(painter, { seed: "x" }, { mode: "inline" });
            expect(render()).toBe(render());
        });

        it("keeps ids distinct between different avatars on one page", () => {
            const id = (seed: string, size: number) =>
                /<clipPath id="([^"]+)"/.exec(renderToString(painter, { seed, size }, { mode: "inline" }))?.[1];
            expect(id("x", 64)).not.toBe(id("x", 32));
        });
    });
});

describe("adapting options for <img>", () => {
    const reduce = { reducedMotion: true, moreContrast: false };
    const contrast = { reducedMotion: false, moreContrast: true };

    it("reports no preferences without a browser", () => {
        expect(viewerPreferences()).toBe(NO_PREFERENCES);
        expect(subscribeViewerPreferences(() => {})).toBeTypeOf("function");
    });

    it("drops animation for reduced motion, and only then", () => {
        expect(adaptForImage({ seed: "x", animation: true }, reduce).animation).toBe(false);
        expect(adaptForImage({ seed: "x", animation: true }, contrast).animation).toBe(true);
    });

    it("turns the auto theme into high contrast, and leaves a chosen theme alone", () => {
        expect(adaptForImage({ seed: "x", theme: "auto" }, contrast).theme).toBe("high-contrast");
        expect(adaptForImage({ seed: "x", theme: "dark" }, contrast).theme).toBe("dark");
        expect(adaptForImage({ seed: "x", theme: "auto" }, reduce).theme).toBe("auto");
    });

    it("does not mutate the caller's options", () => {
        const options = { seed: "x", animation: true };
        adaptForImage(options, reduce);
        expect(options.animation).toBe(true);
    });

    it("produces motionless output for reduced motion", () => {
        const options = adaptForImage({ seed: "x", animation: true }, reduce);
        expect(createAvatar(painter, options).svg).toBe(createAvatar(painter, { seed: "x" }).svg);
    });

    it("adapts group items and shared options, leaving seeds alone", () => {
        const [items, group] = adaptGroupForImage<AvatarOptions>(
            ["a", { seed: "b", animation: true }],
            { max: 1, options: { animation: true } },
            reduce,
        );
        expect(items[0]).toBe("a");
        expect((items[1] as AvatarOptions).animation).toBe(false);
        expect(group.options?.animation).toBe(false);
        expect(group.max).toBe(1);
    });

    it("tolerates a group with no options", () => {
        expect(adaptGroupForImage<AvatarOptions>(["a"], undefined, reduce)[1].options).toBeUndefined();
    });
});
