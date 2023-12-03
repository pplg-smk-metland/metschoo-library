import { ref } from "vue"

export function useDialog() {
  const dialog = ref({
    isOpen: false,
    message: "",
    open(message) {
      this.isOpen = true
      this.message = message
    },

    close() {
      this.isOpen = false
      this.message = ""
    },
  })

  return { dialog }
}
