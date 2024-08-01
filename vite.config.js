import { fileURLToPath, URL } from "node:url"
import Icons from "unplugin-icons/vite"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://library.smkmetland.net",
  plugins: [
    vue(),
    Icons({
      compiler: "vue3",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
