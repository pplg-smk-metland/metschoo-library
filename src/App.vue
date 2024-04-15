<script setup lang="ts">
import { onMounted, provide, ref } from "vue"
import { RouterView } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import TheFooter from "@/components/TheFooter.vue"

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
