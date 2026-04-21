<script lang="ts">
    import Avatar from "@avatar-svelte/src/Avatar.svelte";
    import { initials } from "@avatar-style-initials/src";
    import { geometric } from "@avatar-style-geometric/src";
    import { pixels } from "@avatar-style-pixels/src";
    import { rings } from "@avatar-style-rings/src";
    import { faces } from "@avatar-style-faces/src";
    import { illustrated } from "@avatar-style-illustrated/src";
    import { anime } from "@avatar-style-anime/src";
    import { abstract } from "@avatar-style-abstract/src";
    import { emoji } from "@avatar-style-emoji/src";
    import { animals } from "@avatar-style-animals/src";
    import { gradient } from "@avatar-style-gradient/src";
    import {
        INITIALS_OPTIONS,
        GEOMETRIC_OPTIONS,
        PIXELS_OPTIONS,
        RINGS_OPTIONS,
        FACES_OPTIONS,
        ILLUSTRATED_OPTIONS,
        ANIME_OPTIONS,
        ABSTRACT_OPTIONS,
        EMOJI_OPTIONS,
        ANIMALS_OPTIONS,
        GRADIENT_OPTIONS,
    } from "../consts";

    const sections = [
        { title: "Initials", style: initials, options: INITIALS_OPTIONS },
        { title: "Geometric", style: geometric, options: GEOMETRIC_OPTIONS },
        { title: "Pixels", style: pixels, options: PIXELS_OPTIONS },
        { title: "Rings", style: rings, options: RINGS_OPTIONS },
        { title: "Faces", style: faces, options: FACES_OPTIONS },
        { title: "Illustrated", style: illustrated, options: ILLUSTRATED_OPTIONS },
        { title: "Anime", style: anime, options: ANIME_OPTIONS },
        { title: "Abstract", style: abstract, options: ABSTRACT_OPTIONS },
        { title: "Emoji", style: emoji, options: EMOJI_OPTIONS },
        { title: "Animals", style: animals, options: ANIMALS_OPTIONS },
        { title: "Gradient", style: gradient, options: GRADIENT_OPTIONS },
    ];
</script>

{#each sections as section (section.title)}
    <section style="margin-bottom: 24px">
        <h2>{section.title}</h2>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
            {#each section.options as opt, i (i)}
                <Avatar style={section.style} options={opt} alt={`${section.title} avatar ${i + 1}`} />
            {/each}
        </div>
    </section>
{/each}
