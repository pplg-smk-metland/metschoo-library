<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const user = ref()

const authStore = useAuthStore()
onMounted(async() => {
  if (!authStore.session) return

  user.value = await authStore.getProfile(authStore.session)
})
</script>

<template>
  <TheHeader>
    <template #header-heading>
      Halo, <span v-if="user">{{ user.nama }}.</span>
      <span v-else>Halo kamu!</span>
    </template>
  </TheHeader>

  <section class="main-section">
    <h2>Rekomendasi</h2>
    <HomeBookList :type-id="1" />
  </section>

  <section class="main-section">
    <h2>Koleksi</h2>
    <HomeBookList :type-id="2" />
  </section>
</template>
