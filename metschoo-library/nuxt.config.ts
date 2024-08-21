// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@primevue/nuxt-module", "@nuxt/eslint", "@nuxtjs/supabase"],
  srcDir: ".",
  css: ["~/assets/base.css", "~/assets/main.css"],
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/login",
      callback: "/",
    },
  }
})

