const getInitials = (name: string): string => {
  if (!name.trim()) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

export interface AvatarOptions {
  name: string;
  backgroundColor?: string | string[];
  gradientDirection?: "vertical" | "horizontal"
  textColor?: string;
  fontSize?: string;
  shape?: "circle" | "square";
  width?: string;
  height?: string;
  tooltip?: boolean;
  additionalClasses?: string;
}

export function createAvatar({
  name,
  backgroundColor = "#ccc",
  gradientDirection = "vertical",
  textColor = "#fff",
  fontSize = "40px",
  shape = "circle",
  width = "100px",
  height = "100px",
  tooltip = false,
  additionalClasses = "",
}: AvatarOptions): HTMLElement {
  const initials = getInitials(name);

  const avatar = document.createElement("div");
  avatar.style.width = width;
  avatar.style.height = height;

  if (Array.isArray(backgroundColor)) {
    const direction = gradientDirection === "vertical" ? "to bottom" : "to right";
    avatar.style.background = `linear-gradient(${direction}, ${backgroundColor.join(", ")})`;
  } else {
    avatar.style.backgroundColor = backgroundColor;
  }

  avatar.style.color = textColor;
  avatar.style.display = "flex";
  avatar.style.justifyContent = "center";
  avatar.style.alignItems = "center";
  avatar.style.fontSize = fontSize;
  avatar.style.borderRadius = shape === "circle" ? "50%" : "0";
  avatar.textContent = initials;

  if (tooltip) {
    avatar.title = name;
  }

  if (additionalClasses) {
    avatar.className = additionalClasses;
  }

  return avatar;
}
