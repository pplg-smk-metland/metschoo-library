<script setup>
import TheNavbar from "@/components/TheNavbar.vue"
</script>

<template>
  <TheNavbar />
  <main>
    <slot>halaman ini belum ada isinya. bentar ya</slot>
  </main>
</template>

<style>
main {
  padding: 1.5rem;
  min-height: 70vh;
  flex-grow: 1;
}
</style>
