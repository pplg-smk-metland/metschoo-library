<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import type { Buku } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BookItem from "@/components/BookItem.vue"

interface Props {
  typeId: number
}

const props = defineProps<Props>()

const booksQuery = supabase
  .from("buku")
  .select(`no_isbn, judul, penulis, tahun_terbit, kategori_id`)
  .eq("kategori_id", props.typeId)
  .limit(20)
type Books = QueryData<typeof booksQuery>
const bukus = ref<Books>([])

const isLoading = ref(false)

async function getBukus() {
  try {
    isLoading.value = true
    const { data, error } = await booksQuery
    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  bukus.value = await getBukus()
})
</script>

<template>
  <ul class="book-list">
    <LoadingSpinner v-if="isLoading" />
    <li v-if="!isLoading && bukus.length === 0">Bukunya ga ada gaes</li>
    <BookItem v-else v-for="buku in bukus" :key="buku.no_isbn" :buku="buku as Buku" />
  </ul>
</template>
