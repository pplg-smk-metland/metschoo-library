<script setup>
const props = defineProps({
  buku: Object,
})
</script>

<template>
  <li class="book">
    <h2>{{ buku.judul }}</h2>
    <p>{{ buku.no_isbn }}</p>
  </li>
</template>

<style>
.book {
  outline: 2px solid #444;
  padding: 2rem;
}
</style>
