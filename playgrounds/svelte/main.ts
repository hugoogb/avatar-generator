import App from "./App.svelte";

const target = document.getElementById("app");
// Svelte 4 API — playground uses the same version as the package peer dep.
if (target) new App({ target });
