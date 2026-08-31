# @avatar-generator/angular

Angular component for [`@avatar-generator`](https://github.com/hugoogb/avatar-generator) —
deterministic SVG avatars, where the same seed always renders the same avatar.

## Install

```bash
npm install @avatar-generator/core @avatar-generator/angular @avatar-generator/style-initials
```

`@angular/core` and `@avatar-generator/core` are peer dependencies.

## Usage

```ts
import { AvatarModule } from "@avatar-generator/angular";

@NgModule({
    imports: [BrowserModule, AvatarModule],
})
export class AppModule {}
```

```ts
import { initials } from "@avatar-generator/style-initials";

@Component({
    template: `<avatar-generator [style]="style" [options]="options" alt="John Doe" />`,
})
export class UserAvatarComponent {
    style = initials;
    options = { seed: "john.doe@example.com", size: 64 };
}
```

## Styles

Any of the eleven style packages works here:
`@avatar-generator/style-initials`, `@avatar-generator/style-geometric`, `@avatar-generator/style-pixels`, `@avatar-generator/style-rings`, `@avatar-generator/style-faces`, `@avatar-generator/style-illustrated`, `@avatar-generator/style-anime`, `@avatar-generator/style-abstract`, `@avatar-generator/style-emoji`, `@avatar-generator/style-animals`, `@avatar-generator/style-gradient`

See the [Angular guide](https://avatar-generator-two.vercel.app/guides/angular/) for the full prop list.

## Documentation

Full documentation: [avatar-generator-two.vercel.app](https://avatar-generator-two.vercel.app)

## License

MIT © [Hugo García Benjumea](https://github.com/hugoogb)
