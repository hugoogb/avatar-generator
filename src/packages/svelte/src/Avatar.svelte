<script lang="ts">
    import { createAvatar, type AvatarOptions, type Style } from "@avatar-generator/core";

    export let style: Style<AvatarOptions>;
    export let options: AvatarOptions;
    export let alt: string = "Avatar";
    let className: string = "";
    export { className as class };

    $: avatar = createAvatar(style, options);
    $: size = options.size ?? 64;
</script>

<img src={avatar.toDataUri()} {alt} class={className} width={size} height={size} />
