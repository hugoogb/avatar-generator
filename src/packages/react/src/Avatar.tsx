import * as React from "react";
import { createAvatar, AvatarOptions } from "@avatar-generator/core";

const Avatar: React.FC<AvatarOptions> = (props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(createAvatar(props));
    }
  }, [props]);

  return <div ref={ref} />;
};

export default Avatar;
