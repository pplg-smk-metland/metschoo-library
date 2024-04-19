<script setup lang="ts">
import { onMounted, provide, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { searchTermKey } from "@/stores/search"
import { RouterView } from "vue-router"
import TheFooter from "@/components/TheFooter.vue"

provide(searchTermKey, ref(""))
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <RouterView></RouterView>

  <TheFooter />
</template>
