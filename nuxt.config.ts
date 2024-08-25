import path from "node:path"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@nuxt/eslint",
    "@nuxtjs/supabase",
    "unplugin-icons/nuxt",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
  ],
  primevue: {
    options: {
      unstyled: true,
    },
    importPT: { from: path.resolve(__dirname, "./assets/presets/lara") },
  },
  srcDir: ".",
  css: ["~/assets/base.css", "~/assets/main.css"],
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/login",
      callback: "/",
    },
  },
})

