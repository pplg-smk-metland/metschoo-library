<script setup>
import { onMounted, provide, ref } from "vue"
import TheNavbar from "./components/TheNavbar.vue"
import TheFooter from "./components/TheFooter.vue"
import { RouterView } from "vue-router"
import { useAuthStore } from "./stores/auth.js"

const searchTerm = ref("")
provide("searchTerm", searchTerm)

onMounted(() => {
  useAuthStore().init()
})
</script>

<template>
  <RouterView></RouterView>

  <TheFooter />
</template>
