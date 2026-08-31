import { NgModule } from "@angular/core";
import { AvatarComponent } from "./Avatar.component";

/**
 * Convenience module for NgModule-based applications.
 *
 * `AvatarComponent` is standalone, so modern applications can add it straight
 * to a component's `imports` and skip this entirely. A standalone component is
 * imported, never declared — declaring one is an error from Angular 19 on.
 */
@NgModule({
    imports: [AvatarComponent],
    exports: [AvatarComponent],
})
export class AvatarModule {}
