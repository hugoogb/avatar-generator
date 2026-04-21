import type { Style } from "@avatar-core/src";
import { Avatar } from "@avatar-react/src";
import { geometric } from "@avatar-style-geometric/src";
import { initials } from "@avatar-style-initials/src";
import { pixels } from "@avatar-style-pixels/src";
import { rings } from "@avatar-style-rings/src";
import { faces } from "@avatar-style-faces/src";
import { illustrated } from "@avatar-style-illustrated/src";
import { anime } from "@avatar-style-anime/src";
import { abstract } from "@avatar-style-abstract/src";
import { emoji } from "@avatar-style-emoji/src";
import { animals } from "@avatar-style-animals/src";
import { gradient } from "@avatar-style-gradient/src";
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
    GEOMETRIC_OPTIONS,
    INITIALS_OPTIONS,
    PIXELS_OPTIONS,
    RINGS_OPTIONS,
    FACES_OPTIONS,
    ILLUSTRATED_OPTIONS,
    ANIME_OPTIONS,
    ABSTRACT_OPTIONS,
    EMOJI_OPTIONS,
    ANIMALS_OPTIONS,
    GRADIENT_OPTIONS,
} from "../consts";

const StyleSection = ({
    title,
    style,
    options,
}: {
    title: string;
    style: Style<Record<string, unknown>>;
    options: Record<string, unknown>[];
}) => (
    <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>{title}</h2>
        <div
            style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                alignItems: "center",
            }}
        >
            {options.map((opt, i) => (
                <Avatar key={i} style={style} options={opt} alt={`${title} avatar ${i + 1}`} />
            ))}
        </div>
    </div>
);

const App = () => {
    return (
        <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
            <h1>Avatar Generator v2.0 - React Playground</h1>

            <StyleSection title="Initials" style={initials} options={INITIALS_OPTIONS} />

            <StyleSection title="Geometric (Identicon)" style={geometric} options={GEOMETRIC_OPTIONS} />

            <StyleSection title="Pixels (Pixel Faces)" style={pixels} options={PIXELS_OPTIONS} />

            <StyleSection title="Rings" style={rings} options={RINGS_OPTIONS} />

            <StyleSection title="Faces" style={faces} options={FACES_OPTIONS} />

            <StyleSection title="Illustrated" style={illustrated} options={ILLUSTRATED_OPTIONS} />

            <StyleSection title="Anime" style={anime} options={ANIME_OPTIONS} />

            <StyleSection title="Abstract" style={abstract} options={ABSTRACT_OPTIONS} />

            <StyleSection title="Emoji" style={emoji} options={EMOJI_OPTIONS} />

            <StyleSection title="Animals" style={animals} options={ANIMALS_OPTIONS} />

            <StyleSection title="Gradient" style={gradient} options={GRADIENT_OPTIONS} />
        </div>
    );
};

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
