<script setup lang="ts">
import Toast from "primevue/toast"
import { getRequests } from "@/lib/request"

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

function acceptRequest() {
  console.log("terima")
}

function rejectRequest() {
  console.log("tolak")
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
      <template #body>
        <div class="flex gap-4">
          <CTA label="terima" @click="acceptRequest" />
          <CTA label="tolak" @click="rejectRequest" severity="danger" />
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast />
</template>
