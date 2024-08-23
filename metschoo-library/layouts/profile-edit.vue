<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <TheNavbar />
  <main>
    <slot />
  </main>
</template>

<style scoped>
main {
  max-width: 100ch;
}
</style>
