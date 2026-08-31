import { createAvatar, type AvatarOptions, type Style } from "@avatar-generator/core";
import { computed, defineComponent, h, type PropType } from "vue";

/**
 * Vue 3 component for rendering avatars.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { Avatar } from "@avatar-generator/vue";
 * import { initials } from "@avatar-generator/style-initials";
 *
 * const style = initials;
 * const options = { seed: "Hugo GB", size: 48 };
 * </script>
 *
 * <template>
 *   <Avatar :style="style" :options="options" alt="Hugo GB" />
 * </template>
 * ```
 */
export const Avatar = defineComponent({
    name: "Avatar",
    props: {
        style: { type: Object as PropType<Style<AvatarOptions>>, required: true },
        options: { type: Object as PropType<AvatarOptions>, required: true },
        alt: { type: String, default: "Avatar" },
        class: { type: String, default: "" },
    },
    setup(props) {
        const avatar = computed(() => createAvatar(props.style, props.options));
        const size = computed(() => props.options.size ?? 64);

        return () =>
            h("img", {
                src: avatar.value.toDataUri(),
                alt: props.alt,
                class: props.class,
                width: size.value,
                height: size.value,
            });
    },
});

export default Avatar;
