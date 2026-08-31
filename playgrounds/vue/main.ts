import { createApp } from "vue";
import App from "./App.vue";

const mount = document.getElementById("app");
if (mount) createApp(App).mount(mount);
