<script lang="ts">
    import {
        adaptForImage,
        createAvatar,
        NO_PREFERENCES,
        subscribeViewerPreferences,
        viewerPreferences,
        type AvatarOptions,
        type Style,
    } from "@avatar-generator/core";

    export let style: Style<AvatarOptions>;
    export let options: AvatarOptions;
    export let alt: string = "Avatar";
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

    $: avatar = createAvatar(style, adaptForImage(options, preferences));
    $: size = options.size ?? 64;
</script>

<img use:watchViewer src={avatar.toDataUri()} {alt} class={className} width={size} height={size} />
