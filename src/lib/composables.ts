import { ref } from "vue"

export function useDialog() {
  const dialog = ref({
    isOpen: false,
    message: "",

    /**
     * opens the dialog.
     * @param {string} message  message to be displayed in the dialog
     * */
    open(message: string) {
      this.isOpen = true
      this.message = message
    },

    /**
     * closes the dialog.
     * */
    close() {
      this.isOpen = false
      this.message = ""
    },
  })

  return { dialog }
}
