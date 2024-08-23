<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} - Metschoo Library` : "Metschoo Library"),
  meta: [
    {
      name: "description",
      content: "Aplikasi Perpustakan Metschoo.",
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
