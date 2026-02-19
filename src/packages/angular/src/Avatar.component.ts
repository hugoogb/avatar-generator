import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  createAvatar,
  type AvatarOptions,
  type Style,
} from "@avatar-generator/core";

/**
 * Angular component for rendering avatars
 *
 * @example
 * ```html
 * <avatar-generator
 *   [style]="initialsStyle"
 *   [options]="{ seed: 'Hugo GB', size: 64 }"
 *   alt="User avatar"
 * />
 * ```
 */
@Component({
  selector: "avatar-generator",
  template: `<img [src]="dataUri" [alt]="alt" [width]="size" [height]="size" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent<T extends AvatarOptions> implements OnChanges {
  /** The style to use for generating the avatar */
  @Input() style!: Style<T>;

  /** Options for the avatar (varies by style) */
  @Input() options!: T;

  /** Alt text for accessibility */
  @Input() alt = "Avatar";

  /** Generated data URI for the SVG */
  dataUri = "";

  /** Size for the image element */
  size = 64;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.style && this.options) {
      this.renderAvatar();
    }
  }

  private renderAvatar(): void {
    const avatar = createAvatar(this.style, this.options);
    this.dataUri = avatar.toDataUri();
    this.size = this.options.size ?? 64;
  }
}
