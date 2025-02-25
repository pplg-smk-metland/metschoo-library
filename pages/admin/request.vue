<script setup lang="ts">
import { Tab, Tabs, TabList, TabPanels, TabPanel, Toast, useToast } from "primevue"
import { getRequests, processRequest } from "@/lib/request"
import type { BookRequest } from "~/types"
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js"
import IconExcel from "~icons/mdi/microsoft-excel"
import xlsx from "xlsx"

useHead({
  title: "request",
})

definePageMeta({
  layout: "admin",
})
const supabase = useSupabaseClient()
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
  email: string,
  type: Exclude<BookRequest["is_accepted"], "processing">
) {
  // cari data request dari array requests menggunakan id
  const found = requests.value!.find((request) => request.id == id)
  if (found) {
    found.is_accepted = type
  }

  const { error } = await supabase.functions.invoke("notify-admin-user-request", {
    body: { email, type },
  })

  if (error instanceof FunctionsHttpError) {
    const errorMessage = await error.context.json()
    console.log("Function returned an error", errorMessage)
  } else if (error instanceof FunctionsRelayError) {
    console.log("Relay error:", error.message)
  } else if (error instanceof FunctionsFetchError) {
    console.log("Fetch error:", error.message)
  }

  let detail

  if ("accepted" === type) {
    detail = "sukses menandai permintaan buku sebagai diterima"
  } else {
    detail = "sukses menandai permintaan buku sebagai ditolak"
  }

  try {
    await processRequest(id, type)

    toast.add({
      severity: "success",
      summary: "sukses memproses buku",
      detail,
      life: 10000,
    })

    //
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

function handleExportToExcel(data: typeof requests.value) {
  if (!data || !data.length) {
    return toast.add({
      severity: "error",
      summary: "Gagal mengekspor!",
      detail: "Tidak ada data untuk diekspor.",
      life: 10000,
    })
  }

  const worksheet = xlsx.utils.json_to_sheet(data)
  const workbook = xlsx.utils.book_new()

  xlsx.utils.book_append_sheet(workbook, worksheet, "request")

  xlsx.writeFileXLSX(workbook, `Request buku - Metschoo Library ${formatDate(new Date())}.xlsx`, {
    compression: true,
  })

  return toast.add({
    severity: "success",
    summary: "sukses mengekspor data request buku!",
    detail: "sukses mengekspor data request buku.",
    life: 10000,
  })
}
</script>

<template>
  <PageHeader heading="request" />

  <section class="main-section">
    <Tabs value="processing">
      <TabList>
        <Tab v-for="tab in tabs" :key="tab.status" :value="tab.status">{{ tab.localized }}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel v-for="tab in tabs" :key="tab.status" :value="tab.status">
          <CTA
            fill
            label="Export ke Excel"
            @click="
              handleExportToExcel(requests?.filter((d) => d.is_accepted === tab.status) || [])
            "
          >
            <IconExcel />
          </CTA>

          <DataTable :value="requests?.filter((d) => d.is_accepted === tab.status) || []">
            <template #empty>
              <p class="text-center py-8">Belum ada request dari pengguna.</p>
            </template>

            <Column field="created_at" header="Tanggal request" sortable>
              <template #body="{ data }">
                {{ formatDate(new Date(data.created_at)) }}
              </template>
            </Column>

            <Column field="pengguna.nama" header="Peminta">
              <template #body="{ data }">
                <RouterLink
                  :to="`/admin/pengguna/${data.pengguna.user_id}/`"
                  class="hover:underline"
                >
                  {{ data.pengguna.nama }}
                </RouterLink>
              </template>
            </Column>

            <Column field="isbn" header="ISBN" />
            <Column field="title" header="Judul" />
            <Column field="category" header="Kategori buku" sortable />

            <Column v-if="tab.status === 'processing'" header="aksi">
              <template #body="{ data }">
                <div class="flex gap-4">
                  <CTA
                    label="terima"
                    @click="handleRequest(data.id, data.pengguna.email, 'accepted')"
                  />
                  <CTA
                    label="tolak"
                    severity="danger"
                    @click="handleRequest(data.id, data.pengguna.email, 'rejected')"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>

  <Toast />
</template>
