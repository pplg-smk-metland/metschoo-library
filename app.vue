<script setup lang="ts">
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.theme = themeStore.getTheme()
})

useHead({
  titleTemplate: (title) => (title ? `${title} - Metschoo Library` : "Metschoo Library"),
  meta: [
    {
      name: "description",
      content: "Aplikasi Perpustakan Metschoo.",
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
