<script setup lang="ts">
import { ref, onMounted } from "vue"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BookItem from "@/components/BookItem.vue"
import { getBukus, type Bukus } from "@/lib/utils"

interface Props {
  typeId: number
}

const { typeId } = defineProps<Props>()

const bukus = ref<Bukus>([])
const isLoading = ref(false)

onMounted(async () => {
  try {
    isLoading.value = true
    bukus.value = await getBukus(typeId)
  } catch (err) {
    console.error((err as PostgrestError).message)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <ul class="book-list">
    <LoadingSpinner v-if="isLoading" />
    <li v-if="!isLoading && !bukus.length">Bukunya ga ada gaes</li>
    <BookItem v-else v-for="buku in bukus" :key="buku.no_isbn" :buku="buku as Buku" />
  </ul>
</template>
