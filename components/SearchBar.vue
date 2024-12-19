<script setup lang="ts">
import InputText from "primevue/inputtext"
import IconSearch from "~icons/mdi/search"
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
      id="search-input"
      v-model="term"
      class="flex-1"
      type="search"
      name="term"
      placeholder="Cari buku disini"
      required
    />

    <CTA id="search-submit" label="Cari" type="submit" fill>
      <IconSearch size="20" />
    </CTA>
  </form>
</template>
