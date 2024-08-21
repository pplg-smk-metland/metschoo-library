<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import TheHeader from "@/components/TheHeader.vue"
import BookItem from "@/components/BookItem.vue"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"
import type { Database } from "~/types/supabase"

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()

const searchTerm = inject(searchTermKey, ref(""))

const books = ref<Buku[] | null>(null)
const isLoading = ref(false)

async function cariBuku() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from("buku")
      .select()
      .textSearch("judul", searchTerm.value, { type: "websearch" })
      .limit(20)

    if (error) throw error

    books.value = data
  } catch (err) {
    alert((err as PostgrestError).message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (searchTerm.value.length !== 0) await cariBuku()
})
</script>

<template>
  <TheHeader @search="async () => await cariBuku()">
    <template #header-heading> Pustaka </template>
    <template #header-text> Eksplor buku disini </template>
  </TheHeader>

  <h2>Hasil pencarian</h2>
  <ul class="book-list">
    <LoadingSpinner v-show="isLoading" />
    <li v-show="!isLoading && !books?.length" class="mesasge">ga ada buku woi</li>
    <BookItem v-for="buku in books" v-show="!isLoading" :key="buku.no_isbn" :buku="buku" />
  </ul>
</template>
