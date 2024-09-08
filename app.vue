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
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "anonymous",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300;400;500&display=swap",
      rel: "stylesheet",
    },
  ],
  htmlAttrs: {
    class: computed(() => themeStore.theme),
  },
  bodyAttrs: {
    class: "bg-surface-100/80 dark:bg-surface-900 dark:text-gray-300",
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
