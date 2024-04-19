<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { type Pengguna } from "@/types/index"

import BaseLayout from "@/layouts/BaseLayout.vue"
import CollectionBooks from "@/components/home/CollectionBooks.vue"
import ReccomendationBooks from "@/components/home/ReccomendationBooks.vue"
import TheHeader from "@/components/TheHeader.vue"

const user = ref<Pengguna | null>(null)

const authStore = useAuthStore()

authStore.$subscribe(async (_, state) => {
  if (state.session) user.value = await authStore.getProfile()
})
</script>

<template>
  <BaseLayout>
    <TheHeader>
      <template #header-heading>
        Halo, <span v-if="user">{{ user.nama }}.</span>
        <span v-else>kamu!</span>
      </template>
    </TheHeader>

    <section class="main-section">
      <ReccomendationBooks />
    </section>

    <section class="main-section">
      <CollectionBooks />
    </section>
  </BaseLayout>
</template>
