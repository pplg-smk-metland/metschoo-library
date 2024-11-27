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
    "@nuxt/fonts",
  ],
  typescript: {
    typeCheck: true,
  },
  postcss: {
    plugins: {
      "postcss-import": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  primevue: {
    autoImport: true,
    options: {
      theme: "none",
      locale: {
        accept: "Ya",
        reject: "Tidak",
        dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
        dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        dayNamesMin: ["Se", "Se", "Ra", "Ka", "Ju", "Sa", "Mi"],
        monthNames: [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ],
        monthNamesShort: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ],
        fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      },
    },
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

  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
      },
    },
  },
})
