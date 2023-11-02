<script setup>
import CollectionBooks from "../components/home/CollectionBooks.vue"
import ReccomendationBooks from "../components/home/ReccomendationBooks.vue"
import SearchBarVue from "../components/SearchBar.vue"
</script>

<template>
  <main>
    <h1>Metschoo Library</h1>
    <section class="search">
      <SearchBarVue></SearchBarVue>
    </section>

    <section class="main-section">
      <ReccomendationBooks />
    </section>

    <section class="main-section">
      <CollectionBooks />
    </section>
  </main>
</template>

<style>
.main-section {
  padding: 2rem;
}
</style>
