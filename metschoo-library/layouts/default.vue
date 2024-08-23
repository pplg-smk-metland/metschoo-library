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
  padding: 1.5rem;
  min-height: 70vh;
  flex-grow: 1;
}
</style>
