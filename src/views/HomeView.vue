<script setup>
import BaseLayout from "../layouts/BaseLayout.vue"
import CollectionBooks from "../components/home/CollectionBooks.vue"
import ReccomendationBooks from "../components/home/ReccomendationBooks.vue"
import SearchBar from "../components/SearchBar.vue"
</script>

<template>
  <BaseLayout>
    <section class="search">
      <h1>Metschoo Library</h1>
      <SearchBar></SearchBar>
    </section>

    <section class="main-section">
      <ReccomendationBooks />
    </section>

    <section class="main-section">
      <CollectionBooks />
    </section>
  </BaseLayout>
</template>
