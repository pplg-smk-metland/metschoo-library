<script setup>
import CollectionBooks from "../components/home/CollectionBooks.vue"
import ReccomendationBooks from "../components/home/ReccomendationBooks.vue"
</script>

<template>
  <h1>Metschoo Library</h1>
  <section class="main-section">
    <ReccomendationBooks />
  </section>

  <section class="main-section">
    <CollectionBooks />
  </section>
</template>

<style>
.main-section {
  padding: 2rem;
}
</style>
