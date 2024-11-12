<script setup lang="ts">
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "@/types"

interface Props {
  typeId: number
}

const { typeId } = defineProps<Props>()

const { data: bukus } = await useAsyncData(String(typeId), async () => {
  try {
    return await getBukus(typeId)
  } catch (err) {
    console.error(err as PostgrestError)
  }
})
</script>

<template>
  <ul class="book-list">
    <li v-if="!bukus">Bukunya ga ada gaes</li>
    <BookItem v-for="buku in bukus" v-else :key="buku.no_isbn" :buku="buku as Buku" />
  </ul>
</template>
