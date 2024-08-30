<script setup lang="ts">
import InputText from "primevue/inputtext"
const term = ref("")

async function searchRedirect() {
  return await navigateTo({
    path: "/pustaka",
    query: {
      term: term.value,
    },
  })
}
</script>

<template>
  <form id="search-form" class="flex gap-4" @submit.prevent="searchRedirect">
    <InputText
      class="flex-1"
      id="search-input"
      type="search"
      name="term"
      placeholder="Cari buku disini"
      v-model="term"
      required
    />
    <CTA id="search-submit" label="Cari" type="submit" />
  </form>
</template>
