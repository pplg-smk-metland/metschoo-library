<script setup lang="ts">
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"
import type { Database } from "~/types/database.types"

useHead({
  title: "Pustaka",
})

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()

async function cariBuku(term: string) {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select()
      .textSearch("judul", term, { type: "websearch" })
      .limit(20)

    if (error) throw error

    return data
  } catch (err) {
    alert((err as PostgrestError).message)
    return []
  }
}

const route = useRoute()
const term = ref(route.query.term)
const books = ref<Buku[]>([])

watch(
  () => route.query.term,
  async (newTerm, _) => {
    const { data } = await useAsyncData("books", async () => cariBuku(newTerm as string))

    if (data.value) books.value = data.value
    term.value = route.query.term
  }
)

onMounted(async () => {
  books.value = await cariBuku(term.value as string)
})
</script>

<template>
  <div class="max-w-screen-2xl mx-auto">
    <TheHeader>
      <template #header-heading> Pustaka </template>
      <template #header-text>
        <span v-if="term && books">
          Menampilkan {{ books.length }} hasil pencarian untuk
          <span class="font-bold">{{ term }}</span>
        </span>
        <span v-else> Eksplor buku di sini. </span>
      </template>
    </TheHeader>

    <section class="main-section">
      <p v-if="!books.length" class="text-center text-gray-400 dark:text-gray-500">
        ga ada bukunya nih. Coba cari yang lain...
      </p>

      <ul class="book-list">
        <BookItem v-for="buku in books" :key="buku.no_isbn" :buku="buku" />
      </ul>
    </section>
  </div>
</template>
