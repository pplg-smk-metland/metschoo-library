<script setup>
import { onMounted, ref } from "vue"
import { useAuthStore } from "../stores/auth"

import BaseLayout from "@/layouts/BaseLayout.vue"
import CollectionBooks from "@/components/home/CollectionBooks.vue"
import ReccomendationBooks from "@/components/home/ReccomendationBooks.vue"
import TheHeader from "../components/TheHeader.vue"

const user = ref({})

onMounted(async () => {
  const authStore = useAuthStore()
  user.value = await authStore.getProfile()
})
</script>

<template>
  <BaseLayout>
    <TheHeader>
      <template #header-heading v-if="user"> Halo, {{ user.nama }}. </template>
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
