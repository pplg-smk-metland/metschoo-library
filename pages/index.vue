<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const authStore = useAuthStore()
const { profile } = authStore
</script>

<template>
  <div class="flex flex-col gap-4 max-w-screen-2xl mx-auto">
    <TheHeader>
      <template #header-heading>
        <span v-if="profile">Halo, {{ profile.nama }}.</span>
        <span v-else>Halo kamu!</span>
      </template>
    </TheHeader>

    <section class="main-section">
      <h2 class="text-lg">Rekomendasi</h2>
      <HomeBookList :type-id="1" />
    </section>

    <section class="main-section">
      <h2 class="text-lg">Koleksi</h2>
      <HomeBookList :type-id="2" />
    </section>
  </div>
</template>
