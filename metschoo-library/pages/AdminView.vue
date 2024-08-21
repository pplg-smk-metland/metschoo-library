<script setup lang="ts">
definePageMeta({
  layout: "admin"
})
</script>

<template>
    <RouterView />
</template>

<style scoped>
.data-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50ch, 1fr));
  gap: 1rem;
}
</style>
