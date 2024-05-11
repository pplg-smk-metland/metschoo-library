<script setup lang="ts">
import { inject, onMounted, ref } from "vue"
import { supabase } from "@/lib/supabase"

import BaseLayout from "@/layouts/BaseLayout.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import TheHeader from "@/components/TheHeader.vue"
import BookItem from "@/components/BookItem.vue"
import type { PostgrestError } from "@supabase/supabase-js"
import { searchTermKey } from "@/stores/search"
import type { Buku } from "@/types"

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
  <BaseLayout>
    <TheHeader @search="async () => await cariBuku()">
      <template #header-heading>Pustaka</template>
      <template #header-text>Eksplor buku disini</template>
    </TheHeader>

    <h2>Hasil pencarian</h2>
    <ul class="book-list">
      <LoadingSpinner v-show="isLoading" />
      <li class="mesasge" v-show="!isLoading && !books?.length">ga ada buku woi</li>
      <BookItem v-show="!isLoading" v-for="buku in books" :key="buku.no_isbn" :buku="buku" />
    </ul>
  </BaseLayout>
</template>
