import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@avatar-angular/src";
import type { AvatarOptions, Style } from "@avatar-core/src";
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

interface Section {
    title: string;
    style: Style<AvatarOptions>;
    options: AvatarOptions[];
}

@Component({
    selector: "app-root",
    standalone: true,
    // AvatarComponent is standalone, so it is imported, not declared.
    imports: [CommonModule, AvatarComponent],
    template: `
        <section *ngFor="let section of sections" style="margin-bottom: 24px">
            <h2>{{ section.title }}</h2>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
                <avatar-generator
                    *ngFor="let opt of section.options; let i = index"
                    [style]="section.style"
                    [options]="opt"
                    [alt]="section.title + ' avatar ' + (i + 1)"
                />
            </div>
        </section>
    `,
})
export class AppComponent {
    sections: Section[] = [
        { title: "Initials", style: initials as Style<AvatarOptions>, options: INITIALS_OPTIONS },
        { title: "Geometric", style: geometric as Style<AvatarOptions>, options: GEOMETRIC_OPTIONS },
        { title: "Pixels", style: pixels as Style<AvatarOptions>, options: PIXELS_OPTIONS },
        { title: "Rings", style: rings as Style<AvatarOptions>, options: RINGS_OPTIONS },
        { title: "Faces", style: faces as Style<AvatarOptions>, options: FACES_OPTIONS },
        { title: "Illustrated", style: illustrated as Style<AvatarOptions>, options: ILLUSTRATED_OPTIONS },
        { title: "Anime", style: anime as Style<AvatarOptions>, options: ANIME_OPTIONS },
        { title: "Abstract", style: abstract as Style<AvatarOptions>, options: ABSTRACT_OPTIONS },
        { title: "Emoji", style: emoji as Style<AvatarOptions>, options: EMOJI_OPTIONS },
        { title: "Animals", style: animals as Style<AvatarOptions>, options: ANIMALS_OPTIONS },
        { title: "Gradient", style: gradient as Style<AvatarOptions>, options: GRADIENT_OPTIONS },
    ];
}
