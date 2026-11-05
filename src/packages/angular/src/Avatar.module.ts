import { NgModule } from "@angular/core";
import { AvatarComponent } from "./Avatar.component";
import { AvatarGroupComponent } from "./AvatarGroup.component";

/**
 * Convenience module for NgModule-based applications.
 *
 * The components are standalone, so modern applications can add them straight
 * to a component's `imports` and skip this entirely. A standalone component is
 * imported, never declared — declaring one is an error from Angular 19 on.
 */
@NgModule({
    imports: [AvatarComponent, AvatarGroupComponent],
    exports: [AvatarComponent, AvatarGroupComponent],
})
export class AvatarModule {}
