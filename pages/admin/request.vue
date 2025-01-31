<script setup lang="ts">
import { Tab, Tabs, TabList, TabPanels, TabPanel, Toast, useToast } from "primevue"
import { getRequests, processRequest } from "@/lib/request"
import type { BookRequest } from "~/types"

useHead({
  title: "request",
})

definePageMeta({
  layout: "admin",
})

const toast = useToast()

const { data: requests, error } = await useAsyncData(async () => await getRequests())

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
  let detail;

  if( "accepted" === type) {
    detail = "sukses menandai permintaan buku sebagai diterima";
  } else {
    detail = "sukses menandai permintaan buku sebagai ditolak";
  }
  try {
    await processRequest(id, type)

    toast.add({
      severity: "success",
      summary: "sukses memproses buku",
      detail,
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

const tabs = [
  {
    status: "processing",
    localized: "Diproses",
  },

  {
    status: "accepted",
    localized: "Diterima",
  },

  {
    status: "rejected",
    localized: "Ditolak",
  },
]
</script>

<template>
  <h1>request</h1>

  <Tabs value="requests">
    <TabList>
      <Tab v-for="tab in tabs" :key="tab.status" :value="tab.status">{{ tab.localized }}</Tab>
    </TabList>

    <TabPanels>
      <TabPanel v-for="tab in tabs" :key="tab.status" :value="tab.status">
        <h2>{{ tab.localized }}</h2>

        <DataTable :value="requests?.filter((d) => d.is_accepted === tab.status) || []">
          <Column field="created_at" header="Tanggal request" sortable>
            <template #body="{ data }">
              {{ formatDate(new Date(data.created_at)) }}
            </template>
          </Column>

          <Column field="pengguna.nama" header="Peminta" />

          <Column field="isbn" header="ISBN" />
          <Column field="title" header="Judul" />
          <Column field="category" header="Kategori buku" sortable />

          <Column v-if="tab.status === 'processing'" header="aksi">
            <template #body="{ data }: { data: BookRequest }">
              <div class="flex gap-4">
                <CTA label="terima" @click="handleRequest(data.id, 'accepted')" />
                <CTA label="tolak" severity="danger" @click="handleRequest(data.id, 'rejected')" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabPanels>
  </Tabs>

  <Toast />
</template>
