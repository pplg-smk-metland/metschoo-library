<script setup>
import { inject, onMounted, ref } from "vue"
import BookItem from "../components/BookItem.vue"
import SearchBar from "../components/SearchBar.vue"
import { supabase } from "../supabase"

const bukuYangDicari = inject("searchTerm")

const books = ref([])
const isLoading = ref(false)

async function cariBuku() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from("buku")
      .select()
      .textSearch("judul", bukuYangDicari.value, { type: "websearch" })
      .limit(20)
    if (error) throw error

    books.value = data
  } catch (err) {
    alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (bukuYangDicari.value.length !== 0) await cariBuku()
})
</script>

<template>
  <main>
    <h1>Search</h1>
    <section class="search">
      <SearchBar @search="cariBuku"></SearchBar>
    </section>

    <ul class="book-list">
      <li v-show="isLoading">Sedang mengambil buku, sebentar ya</li>
      <li class="mesasge" v-show="!isLoading && !books.length">ga ada buku woi</li>
      <BookItem v-for="buku in books" :key="buku.no_isbn" :buku="buku"></BookItem>
    </ul>
  </main>
</template>
