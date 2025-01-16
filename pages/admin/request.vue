<script setup lang="ts">
import type { Database } from "~/types/database.types"

useHead({
  title: "request",
})
definePageMeta({
  layout: "admin",
})

const { data } = await useAsyncData(async () => {
  const supabase = useSupabaseClient()
  const query = supabase.from("book_requests").select()

  const { data, error } = await query
  return data
})
</script>

<template>
  <h1>request</h1>

  <DataTable :value="data">
    <Column header="Tanggal request">
      <template #body="{ data }">
        <!-- {{ formatDate(data.created_at) }} -->
      </template>
    </Column>
    <Column field="isbn" header="ISBN" />
    <Column field="title" header="Judul" />
  </DataTable>
</template>
