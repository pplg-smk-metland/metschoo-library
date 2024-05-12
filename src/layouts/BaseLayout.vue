<script setup lang="ts">
import TheNavbar from "@/components/TheNavbar.vue"
</script>

<template>
  <TheNavbar />
  <main>
    <slot>halaman ini belum ada isinya. bentar ya</slot>
  </main>
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
