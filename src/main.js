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
    select: {
      root: "p-select form-control",
      label: "p-select-label",
      dropdown: "p-select-dropdown",
      overlay: "p-select-overlay",
      list: "p-select-list",
      option: "p-select-option",
      optionLabel: "p-select-option-label",
    },
  },
})

app.mount("#app")
