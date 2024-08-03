<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { type Pengguna } from "@/types/index"

import BaseLayout from "@/layouts/BaseLayout.vue"
import BookList from "@/components/home/BookList.vue"
import TheHeader from "@/components/TheHeader.vue"

const user = ref<Pengguna | null>(null)

const authStore = useAuthStore()

onMounted(() => {
  setTimeout(() => {
    authStore.getProfile(authStore.session!).then((profile) => (user.value = profile))
  }, 200)
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
      <h2>Rekomendasi</h2>
      <BookList :type-id="1" />
    </section>

    <section class="main-section">
      <h2>Koleksi</h2>
      <BookList :type-id="2" />
    </section>
  </BaseLayout>
</template>
