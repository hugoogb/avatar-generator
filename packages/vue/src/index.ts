import { defineComponent, onMounted, ref, watch } from "vue";
import { createAvatar, AvatarOptions } from "@avatar-generator/core";

export default defineComponent({
  name: "Avatar",
  props: {
    name: String,
    backgroundColor: String,
    textColor: String,
    fontSize: String,
    shape: String,
  },
  setup(props) {
    const avatarRef = ref<HTMLDivElement | null>(null);

    const renderAvatar = () => {
      if (avatarRef.value) {
        avatarRef.value.innerHTML = "";
        avatarRef.value.appendChild(createAvatar(props as AvatarOptions));
      }
    };

    onMounted(renderAvatar);
    watch(() => props, renderAvatar, { deep: true });

    return { avatarRef };
  },
});
