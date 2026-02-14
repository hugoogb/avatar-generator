import { Avatar } from "@avatar-react/src";
import { geometric } from "@avatar-style-geometric/src";
import { initials } from "@avatar-style-initials/src";
import { pixels } from "@avatar-style-pixels/src";
import { rings } from "@avatar-style-rings/src";
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  GEOMETRIC_OPTIONS,
  INITIALS_OPTIONS,
  PIXELS_OPTIONS,
  RINGS_OPTIONS,
} from "../consts";

const StyleSection = ({
  title,
  style,
  options,
}: {
  title: string;
  style: any;
  options: any[];
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
        <Avatar
          key={i}
          style={style}
          options={opt}
          alt={`${title} avatar ${i + 1}`}
        />
      ))}
    </div>
  </div>
);

const App = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Avatar Generator v2.0 - React Playground</h1>

      <StyleSection
        title="Initials"
        style={initials}
        options={INITIALS_OPTIONS}
      />

      <StyleSection
        title="Geometric"
        style={geometric}
        options={GEOMETRIC_OPTIONS}
      />

      <StyleSection title="Pixels" style={pixels} options={PIXELS_OPTIONS} />

      <StyleSection title="Rings" style={rings} options={RINGS_OPTIONS} />
    </div>
  );
};

const rootElement = document.getElementById("app");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
