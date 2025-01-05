import * as React from "react";
import { createRoot } from "react-dom/client";
import { AvatarOptions } from "@avatar-core/src";
import { Avatar } from "@avatar-react/src";
import { AVATAR_OPTIONS } from "../consts";

const App = () => {
  const avatarOptions: AvatarOptions[] = AVATAR_OPTIONS;

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {avatarOptions.map((props) => (
        <Avatar {...props} />
      ))}
    </div>
  );
};

const rootElement = document.getElementById("app");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
