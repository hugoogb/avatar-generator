import {
    adaptGroupForImage,
    createAvatarGroup,
    type AvatarGroupItem,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-generator/core";
import { computed, defineComponent, h, type PropType } from "vue";
import { useViewerPreferences } from "./useViewerPreferences";

/**
 * Vue 3 component for a row of overlapping avatars.
 *
 * @example
 * ```vue
 * <AvatarGroup :style="faces" :items="['ana', 'ben', 'chi']" :options="{ size: 40, max: 2 }" alt="Project team" />
 * ```
 */
export const AvatarGroup = defineComponent({
    name: "AvatarGroup",
    props: {
        style: { type: Object as PropType<Style<AvatarOptions>>, required: true },
        items: { type: Array as PropType<AvatarGroupItem[]>, required: true },
        options: { type: Object as PropType<AvatarGroupOptions>, default: undefined },
        alt: { type: String, default: undefined },
        class: { type: String, default: "" },
    },
    setup(props) {
        const preferences = useViewerPreferences();
        const group = computed(() =>
            createAvatarGroup(props.style, ...adaptGroupForImage(props.items, props.options, preferences.value)),
        );

        return () =>
            h("img", {
                src: group.value.toDataUri(),
                alt: props.alt ?? group.value.label,
                class: props.class,
                width: group.value.width,
                height: group.value.height,
            });
    },
});

export default AvatarGroup;
