import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"
import ConfirmationService from "primevue/confirmationservice"
import ToastService from "primevue/toastservice"

import App from "./App.vue"
import router from "./router"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  unstyled: true,
  pt: {
    table: {
      class: "p-table",
    },
    column: {
      columnHeaderContent: {
        class: "p-table-header",
      },
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
    panelMenu: {
      root: "p-panelmenu",
      headerContent: "p-panelmenu-header-content",
      headerLink: "p-panelmenu-header-link",
      rootList: "p-panelmenu-list",
      menuItem: "p-panelmenu-item",
    },
    confirmPopup: {
      root: "p-confirmpopup",
      content: "p-confirmpopup-content",
      footer: "p-confirmpopup-footer",
    },
    toast: {
      root: "p-toast",
      messageContent: "p-toast-message-content",
      messageIcon: "p-toast-icon",
      closeButton: "p-toast-close-button",
      buttonContainer: "p-toast-button-container",
    },
    dialog: {
      root: "p-confirmdialog",
      header: "p-confirmdialog-header",
      title: "p-confirmdialog-title",
      content: "p-confirmdialog-content",
      footer: "p-confirmdialog-footer",
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)

app.mount("#app")