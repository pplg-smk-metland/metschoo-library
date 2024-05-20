import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"

import App from "./App.vue"
import router from "./router"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  unstyled: true,
  pt: {
    table: {
      root: "p-table",
    },
    column: {
      headerContent: "p-table-header",
      bodyCell: "p-table-cell",
      sort: "p-sort",
    },
  },
})

app.mount("#app")
