<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="max-w-[100ch] mx-auto flex flex-col gap-4">
      <slot />
    </div>
  </NuxtLayout>
</template>
