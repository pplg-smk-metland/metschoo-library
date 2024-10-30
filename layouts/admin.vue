<script lang="ts" setup>
import type { Pengguna } from "@/types"
import { ref } from "vue"

const authStore = useAuthStore()

const profile = ref<Pengguna | null>(null)

onMounted(async () => {
  await authStore.init()
  authStore.$subscribe((_, state) => {
    if (!state.profile) return

    profile.value = state.profile
  })
})
</script>

<template>
  <div class="grid flex-1 wrapper">
    <TheNavbar />
    <AdminSidebar :profile="profile" />
    <main class="p-4 flex flex-col align-stretch gap-4 mx-auto">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  grid-template-areas:
    "navbar navbar"
    "sidebar content";
  grid-template-columns: 25ch minmax(0, 1fr);
  grid-template-rows: min-content auto;
}

main {
  grid-area: content;
  width: min(150ch, 100%);
}
</style>
