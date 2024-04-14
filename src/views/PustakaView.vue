<script setup>
import { inject, onMounted, ref } from "vue"
import { supabase } from "@/lib/supabase"

import BaseLayout from "@/layouts/BaseLayout.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import TheHeader from "../components/TheHeader.vue"
import BookItem from "@/components/BookItem.vue"

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
    <TheHeader @search="async () => await cariBuku()">
      <template #header-heading>Pustaka</template>
      <template #header-text>Eksplor buku disini</template>
    </TheHeader>

    <h2>Hasil pencarian</h2>
    <ul class="book-list">
      <LoadingSpinner v-show="isLoading" />
      <li class="mesasge" v-show="!isLoading && !books.length">ga ada buku woi</li>
      <BookItem v-show="!isLoading" v-for="buku in books" :key="buku.no_isbn" :buku="buku" />
    </ul>
  </BaseLayout>
</template>
