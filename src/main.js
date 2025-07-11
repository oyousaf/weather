import { createApp } from "vue";
import App from "./App.vue";
import "./assets/globals.css";
import { MotionPlugin } from "@vueuse/motion";
import VueFlags from "vue-flags";

const app = createApp(App);

app.use(MotionPlugin);
app.use(VueFlags, {
  cdn: true,    
  useSvg: true, 
});

app.mount("#app");
