<script setup>
import { inject, onMounted, ref } from "vue"
import BookItem from "../components/BookItem.vue"
import SearchBar from "../components/SearchBar.vue"
import { supabase } from "../supabase"

const bukuYangDicari = inject("searchTerm")

const books = ref([])

async function cariBuku() {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select()
      .textSearch("judul", bukuYangDicari.value, { type: "websearch" })
      .limit(20)
    if (error) throw error
    console.log(bukuYangDicari)
    console.log(data)
    books.value = data
  } catch (err) {
    alert(err.message)
  }
}

onMounted(async () => {
  await cariBuku()
})
</script>

<template>
  <main>
    <h1>Search</h1>
    <section class="search">
      <SearchBar @search="cariBuku"></SearchBar>
    </section>

    <ul class="book-list">
      <li class="mesasge" v-show="!books.length">ga ada buku woi</li>
      <BookItem v-for="buku in books" :key="buku.no_isbn" :buku="buku"></BookItem>
    </ul>
  </main>
</template>
