import { createApp } from "vue"
import router from "./router"
import App from "./App.vue"
import "normalize.css"
import "./style.css"
let app = createApp(App)
app.use(router).mount("#app")
