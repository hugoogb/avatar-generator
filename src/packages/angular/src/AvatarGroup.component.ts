import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import {
    adaptGroupForImage,
    createAvatarGroup,
    type AvatarGroupItem,
    type AvatarGroupOptions,
    type AvatarOptions,
    type Style,
} from "@avatar-generator/core";

/**
 * Angular component for a row of overlapping avatars.
 *
 * @example
 * ```html
 * <avatar-generator-group
 *   [style]="faces"
 *   [items]="['ana', 'ben', 'chi', 'dee']"
 *   [options]="{ size: 40, max: 3 }"
 *   alt="Project team"
 * />
 * ```
 */
@Component({
    selector: "avatar-generator-group",
    standalone: true,
    template: `<img [src]="dataUri" [alt]="alt ?? label" [width]="width" [height]="height" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarGroupComponent<T extends AvatarOptions> implements OnChanges {
    /** The style every avatar in the group uses */
    @Input() style!: Style<T>;

    /** The people in the group: seeds, or full options */
    @Input() items!: AvatarGroupItem<T>[];

    /** Layout options such as `size`, `overlap` and `max` */
    @Input() options?: AvatarGroupOptions<T>;

    /** Alt text. Defaults to `options.title`, then to a count */
    @Input() alt?: string;

    /** Generated data URI for the SVG */
    dataUri = "";

    /** Accessible name from the group */
    label = "";

    /** Width of the image element */
    width = 0;

    /** Height of the image element */
    height = 0;

    ngOnChanges(_changes: SimpleChanges): void {
        if (!this.style || !this.items) return;
        const group = createAvatarGroup(this.style, ...adaptGroupForImage(this.items, this.options));
        this.dataUri = group.toDataUri();
        this.label = group.label;
        this.width = group.width;
        this.height = group.height;
    }
}
