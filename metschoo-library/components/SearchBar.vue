<script setup lang="ts">
const route = useRoute()

import CTA from "@/components/CTA.vue"

const emit = defineEmits(["search"])
</script>

<template>
  <form id="search-form" action="/pustaka">
    <input id="search-input" type="search" name="term" placeholder="Cari buku disini" required />
    <CTA id="search-submit" label="Cari" type="submit" />
  </form>
</template>

<style scoped>
#search-form {
  display: flex;
  gap: 1rem;
}

#search-input {
  flex-grow: 1;
}

#search-form .btn {
  margin: 0;
}
</style>
