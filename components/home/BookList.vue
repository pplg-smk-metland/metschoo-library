<script setup lang="ts">
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"

interface Props {
  typeId: number
}

const { typeId } = defineProps<Props>()

const bukus = ref<Buku[]>([])
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
    <BookItem v-for="buku in bukus" v-else :key="buku.no_isbn" :buku="buku as Buku" />
  </ul>
</template>
