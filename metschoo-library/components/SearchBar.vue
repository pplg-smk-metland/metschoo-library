<script setup lang="ts">
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
  <form id="search-form" @submit.prevent="searchRedirect">
    <input
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
