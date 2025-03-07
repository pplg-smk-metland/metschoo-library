<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const authStore = useAuthStore()
const user = useSupabaseUser()
const router = useRouter()

if (user.value?.user_metadata.new) {
  router.push("/profil/edit")
}

const { data: profile } = await useLazyAsyncData(async () => {
  if (user.value) return await authStore.getProfile(user.value.id)
  return false
})

const { data: categories } = await useLazyAsyncData(async () => {
  const categories = await getAllAvailableCategories()
  return categories
})
</script>

<template>
  <div class="flex flex-col gap-4 max-w-screen-2xl mx-auto">
    <TheHeader>
      <template #header-heading>
        <span v-if="profile">Halo, {{ profile.nama }}.</span>
        <span v-else>Halo kamu!</span>
      </template>
    </TheHeader>

    <template v-for="category in categories" :key="category.id">
      <section class="main-section">
        <h2 class="text-lg">{{ category.kategori }}</h2>
        <HomeBookList :type-id="category.id" />
      </section>
    </template>
  </div>
</template>
