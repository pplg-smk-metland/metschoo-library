<script setup lang="ts">
import { onMounted, provide, ref, type InjectionKey, type Ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { searchTermKey } from "@/stores/search"
import { RouterView } from "vue-router"
import TheFooter from "@/components/TheFooter.vue"

const searchTerm = ref("")

provide(searchTermKey, searchTerm)

onMounted(() => {
  useAuthStore().init()
})
</script>

<template>
  <RouterView></RouterView>

  <TheFooter />
</template>
