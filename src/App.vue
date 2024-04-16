<script setup lang="ts">
import { onMounted, provide, ref, type InjectionKey, type Ref } from "vue"
import { RouterView } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import TheFooter from "@/components/TheFooter.vue"

const searchTerm = ref("")
const searchTermKey = Symbol() as InjectionKey<Ref<string>>

provide(searchTermKey, searchTerm)

onMounted(() => {
  useAuthStore().init()
})
</script>

<template>
  <RouterView></RouterView>

  <TheFooter />
</template>
