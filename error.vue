<script setup lang="ts">
import type { NuxtError } from "#app"

const themeStore = useThemeStore()

useHead({
  title: "404 Gak Ketemu",
  bodyAttrs: {
    class: computed(() => [
      "bg-surface-100/80 dark:bg-surface-900 dark:text-gray-300",
      themeStore.theme ?? "",
    ]),
  },
})

const props = defineProps({
  error: Object as () => NuxtError,
})

if (import.meta.dev) console.log(props.error)
const handleError = () => clearError({ redirect: "/" })
</script>

<template>
  <NuxtLayout name="default">
    <section class="flex flex-col items-center">
      <template v-if="error?.statusCode === 404">
        <h1>Halamannya gak ketemu!</h1>
        <p>Maaf ya. Balik lagi aja ke beranda gih</p>
      </template>

      <template v-else>
        <h1>Ada yang salah!</h1>
        <p>Ga tau deh kenapa. Laporkan ke admin atau kembali ke beranda</p>
      </template>

      <CTA label="kembali ke beranda" @click="handleError" />
    </section>
  </NuxtLayout>
</template>
