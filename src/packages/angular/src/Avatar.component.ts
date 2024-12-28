import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { createAvatar, AvatarOptions } from "@avatar-generator/core";

@Component({
  selector: "avatar-generator",
  template: `<div #avatarContainer></div>`,
})
export class AvatarComponent implements OnChanges {
  @Input() name!: string;
  @Input() backgroundColor = "#ccc";
  @Input() textColor = "#fff";
  @Input() fontSize = "40px";
  @Input() shape: "circle" | "square" = "circle";

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.renderAvatar();
  }

  private renderAvatar(): void {
    const container = this.el.nativeElement.querySelector("#avatarContainer");
    const avatarOptions: AvatarOptions = {
      name: this.name,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      fontSize: this.fontSize,
      shape: this.shape,
    };

    if (container) {
      container.innerHTML = "";
      container.appendChild(createAvatar(avatarOptions));
    }
  }
}
