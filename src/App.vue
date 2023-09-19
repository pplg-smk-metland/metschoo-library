<script setup>
import { onMounted } from "vue"
import TheNavbar from "./components/TheNavbar.vue"
import TheFooter from "./components/TheFooter.vue"
import { RouterView } from "vue-router"
import { useAuthStore } from "./stores/auth.js"

onMounted(() => {
  useAuthStore().init()
})
</script>

<template>
  <TheNavbar />
  <main>
    <RouterView></RouterView>
  </main>

  <TheFooter />
</template>

<style>
main {
  flex-grow: 1;
}
</style>
