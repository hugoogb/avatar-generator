export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export interface AvatarOptions {
  name: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  shape?: "circle" | "square";
}

export function createAvatar({
  name,
  backgroundColor = "#ccc",
  textColor = "#fff",
  fontSize = "40px",
  shape = "circle",
}: AvatarOptions): HTMLElement {
  const initials = getInitials(name);

  const avatar = document.createElement("div");
  avatar.style.width = "100px";
  avatar.style.height = "100px";
  avatar.style.backgroundColor = backgroundColor;
  avatar.style.color = textColor;
  avatar.style.display = "flex";
  avatar.style.justifyContent = "center";
  avatar.style.alignItems = "center";
  avatar.style.fontSize = fontSize;
  avatar.style.borderRadius = shape === "circle" ? "50%" : "0";
  avatar.textContent = initials;

  return avatar;
}
