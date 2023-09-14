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

  <RouterView></RouterView>

  <TheFooter />
</template>
