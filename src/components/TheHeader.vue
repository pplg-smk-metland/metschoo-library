<script setup lang="ts">
import SearchBar from "@/components/SearchBar.vue"

defineEmits(["search"])
</script>

<template>
  <header>
    <div class="header__text">
      <h1><slot name="header-heading">Metschoo Library</slot></h1>
      <p><slot name="header-text">Selamat datang di Metschoo Library!</slot></p>
    </div>

    <div class="header__search-bar">
      <SearchBar @search="$emit('search')" />
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  flex-wrap: wrap;
}

header > * {
  flex-grow: 1;
}
</style>
