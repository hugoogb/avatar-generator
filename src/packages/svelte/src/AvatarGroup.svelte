<script lang="ts">
    import {
        adaptGroupForImage,
        createAvatarGroup,
        NO_PREFERENCES,
        subscribeViewerPreferences,
        viewerPreferences,
        type AvatarGroupItem,
        type AvatarGroupOptions,
        type AvatarOptions,
        type Style,
    } from "@avatar-generator/core";

    export let style: Style<AvatarOptions>;
    export let items: AvatarGroupItem[];
    export let options: AvatarGroupOptions | undefined = undefined;
    export let alt: string | undefined = undefined;
    let className: string = "";
    export { className as class };

    // An action rather than `onMount`: it only runs in the browser, so hydration
    // matches the server's markup, and the compiler emits it directly. `onMount`
    // comes from the `svelte` import, which a toolchain lacking the `browser`
    // condition resolves to the server build, where it silently does nothing.
    let preferences = NO_PREFERENCES;
    function watchViewer() {
        const update = () => (preferences = viewerPreferences());
        update();
        return { destroy: subscribeViewerPreferences(update) };
    }

    $: group = createAvatarGroup(style, ...adaptGroupForImage(items, options, preferences));
</script>

<img use:watchViewer src={group.toDataUri()} alt={alt ?? group.label} class={className} width={group.width} height={group.height} />
