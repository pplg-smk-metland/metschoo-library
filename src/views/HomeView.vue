<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { type Pengguna } from "@/types/index"

import BaseLayout from "@/layouts/BaseLayout.vue"
import CollectionBooks from "@/components/home/CollectionBooks.vue"
import ReccomendationBooks from "@/components/home/ReccomendationBooks.vue"
import TheHeader from "@/components/TheHeader.vue"

const user = ref<Pengguna | null>(null)

onMounted(async () => {
  const authStore = useAuthStore()
  const profile = await authStore.getProfile()
  if (profile) user.value = profile
})
</script>

<template>
  <BaseLayout>
    <TheHeader>
      <template #header-heading v-if="user"> Halo, {{ user?.nama }}. </template>
      <template #header-heading v-else> Halo kamu! </template>
    </TheHeader>

    <section class="main-section">
      <ReccomendationBooks />
    </section>

    <section class="main-section">
      <CollectionBooks />
    </section>
  </BaseLayout>
</template>
