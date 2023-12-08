<script setup>
import SearchBar from "@/components/SearchBar.vue"
</script>

<template>
  <header>
    <div class="header__text">
      <h1><slot name="header-heading">Metschoo Library</slot></h1>
      <p><slot name="header-text">Selamat datang di Metschoo Library!</slot></p>
    </div>

    <div class="header__search-bar">
      <SearchBar />
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
