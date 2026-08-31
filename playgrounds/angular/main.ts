import { bootstrapApplication } from "@angular/platform-browser";
import { provideExperimentalZonelessChangeDetection } from "@angular/core";
import { AppComponent } from "./App.component";

// Zoneless keeps zone.js out of the playground entirely; the avatars render
// from bound inputs and never need zone-patched async change detection.
bootstrapApplication(AppComponent, {
    providers: [provideExperimentalZonelessChangeDetection()],
}).catch((err) => console.error(err));
