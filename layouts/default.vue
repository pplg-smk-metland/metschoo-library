<script setup lang="ts">
const authStore = useAuthStore()

await useAsyncData(() => authStore.init().then(() => true))
</script>

<template>
  <TheNavbar />
  <main class="p-2 md:p-8">
    <slot />
  </main>
  <TheFooter />
</template>

<style>
body {
  background-image: url("/assets/bg-ellipse.svg"), url("/assets/bg-ellipse-2.svg");
  background-position:
    right bottom,
    left top;
  background-repeat: no-repeat;
}

main {
  min-height: 70vh;
  flex-grow: 1;
}
</style>
