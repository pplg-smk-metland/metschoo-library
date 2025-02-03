<script setup lang="ts">
const themeStore = useThemeStore()

useHead({
  titleTemplate: (title) => (title ? `${title} - Metschoo Library` : "Metschoo Library"),
  meta: [
    {
      name: "description",
      content: "Aplikasi Perpustakan Metschoo.",
    },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "logo.svg" }],
  bodyAttrs: {
    class: computed(() => [
      "bg-surface-100/80 dark:bg-surface-950 dark:text-gray-300",
      // on the server themeStore.theme is always undefined
      // so we pass an empty string like so
      themeStore.theme ?? "",
    ]),
  },
})

onMounted(() => {
  themeStore.theme = themeStore.getTheme()
})

const authStore = useAuthStore()
useLazyAsyncData(() => authStore.init().then(() => true))
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
