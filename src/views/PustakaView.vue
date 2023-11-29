<script setup>
import { inject, onMounted, ref } from "vue"
import { supabase } from "@/lib/supabase"

import BaseLayout from "@/layouts/BaseLayout.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BookItem from "@/components/BookItem.vue"
import SearchBar from "@/components/SearchBar.vue"

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
  <BaseLayout>
    <h1>Pustaka</h1>

    <h2>Cari buku</h2>
    <section class="search">
      <SearchBar @search="cariBuku"></SearchBar>
    </section>

    <h2>Hasil pencarian</h2>
    <ul class="book-list">
      <LoadingSpinner v-show="isLoading" />
      <li class="mesasge" v-show="!isLoading && !books.length">ga ada buku woi</li>
      <BookItem v-for="buku in books" :key="buku.no_isbn" :buku="buku"></BookItem>
    </ul>
  </BaseLayout>
</template>
