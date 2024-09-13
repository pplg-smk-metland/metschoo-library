<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import TheHeader from "@/components/TheHeader.vue"
import BookItem from "@/components/BookItem.vue"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"
import type { Database } from "~/types/database.types"

useHead({
  title: "Pustaka",
})

definePageMeta({
  layout: "default",
})

const route = useRoute()

const supabase = useSupabaseClient<Database>()

const searchTerm = ref(route.query.term ?? "")

const books = ref<Buku[]>([])
const isLoading = ref(false)

watch(
  () => route.query.term,
  async (newTerm, _) => {
    if (!newTerm) searchTerm.value = ""
    searchTerm.value = newTerm as string
    await cariBuku(searchTerm.value)
  }
)

async function cariBuku(term: string) {
  isLoading.value = true

  try {
    const { data, error } = await supabase
      .from("buku")
      .select()
      .textSearch("judul", term, { type: "websearch" })
      .limit(20)

    if (error) throw error

    books.value = data
  } catch (err) {
    alert((err as PostgrestError).message)
    books.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (searchTerm.value.length) await cariBuku(searchTerm.value as string)
})
</script>

<template>
  <TheHeader>
    <template #header-heading> Pustaka </template>
    <template #header-text>
      <span v-if="searchTerm.length && books">
        Menampilkan {{ books.length }} hasil pencarian untuk
        <span class="font-bold">{{ searchTerm }}</span>
      </span>
      <span v-else> Eksplor buku di sini. </span>
    </template>
  </TheHeader>

  <section class="main-section">
    <LoadingSpinner v-show="isLoading" />
    <p v-if="!isLoading && !books.length" class="text-center text-gray-400 dark:text-gray-500">
      ga ada bukunya nih. Coba cari yang lain...
    </p>

    <ul class="book-list">
      <BookItem v-for="buku in books" v-show="!isLoading" :key="buku.no_isbn" :buku="buku" />
    </ul>
  </section>
</template>
