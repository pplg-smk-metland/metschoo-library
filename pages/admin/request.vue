<script setup lang="ts">
import Toast from "primevue/toast"
import { getRequests, processRequest } from "@/lib/request"
import type { BookRequest } from "~/types"

useHead({
  title: "request",
})

definePageMeta({
  layout: "admin",
})

const toast = useToast()

const { data, error } = await useAsyncData(async () => await getRequests())

if (error) {
  toast.add({
    severity: "error",
    summary: "gagal mengambil data request!",
    detail: "gagal mengambil data request, silahkan coba lagi nanti.",
    life: 10000,
  })
}

async function handleRequest(
  id: BookRequest["id"],
  type: Exclude<BookRequest["is_accepted"], "processing">
) {
  try {
    await processRequest(id, type)

    toast.add({
      severity: "success",
      summary: "sukses memproses buku",
      detail:
        "sukses menandai permintaan buku sebagai " + type === "accepted" ? "diterima" : "ditolak",
      life: 10000,
    })
  } catch (error) {
    console.error(error)

    toast.add({
      severity: "error",
      detail: "ada kesalahan saat menyetujui permintaan buku, silahkan coba lagi.",
      summary: "gagal menyetujui permintaan buku ",
      life: 10000,
    })
  }
}
</script>

<template>
  <h1>request</h1>

  <DataTable :value="data">
    <Column field="created_at" header="Tanggal request" sortable>
      <template #body="{ data }">
        {{ formatDate(new Date(data.created_at)) }}
      </template>
    </Column>

    <Column field="isbn" header="ISBN" />
    <Column field="title" header="Judul" />

    <Column header="aksi">
      <template #body="{ data }: { data: BookRequest }">
        <div class="flex gap-4">
          <CTA label="terima" @click="handleRequest(data.id, 'accepted')" />
          <CTA label="tolak" @click="handleRequest(data.id, 'rejected')" severity="danger" />
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast />
</template>
