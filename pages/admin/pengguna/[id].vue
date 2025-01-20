<script setup lang="ts">
import { formatDate } from "#imports"
import type { Database } from "~/types/database.types"
import type { PeminjamanData } from "../index.vue"
import { DataTable, Column, Divider } from "primevue"
import IconArrowLeft from "~icons/mdi/arrow-left"

definePageMeta({
  layout: "profile-edit",
})

const route = useRoute()
const userId = route.params.id

const supabase = useSupabaseClient<Database>()

const { data: pengguna } = await useAsyncData(async () => {
  const { data, error } = await supabase.from("pengguna").select("*").eq("user_id", userId).single()
  if (error) throw error
  return data
})

const { data: peminjaman } = await useAsyncData(async () => {
  const { data, error } = await supabase
    .from("peminjaman")
    .select(
      "*, peminjaman_detail(*, peminjaman_state(name)), pengguna(nama, kelas, jurusan), buku(*)"
    )
    .order("tgl_pinjam", { ascending: true })
    .order("created_at", { referencedTable: "peminjaman_detail", ascending: false })
    .eq("user_id", userId)

  if (error) throw error
  return data
})

const { data: kunjungan } = await useAsyncData(async () => {
  const { data, error } = await supabase
    .from("kunjungan")
    .select("timestamp, event")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true })

  if (error) throw error
  return data
})

// TODO: pindah ke database
// const keteranganText = (state_id: Peminjaman["state_id"]) => {
//   switch (state_id) {
//     case 1:
//       return "menunggu konfirmasi"
//     case 2:
//       return "sedang dipinjam"
//     case 3:
//       return "dibatalkan"
//     case 4:
//       return "menunggu konfirmasi pengembalian"
//     case 5:
//       return "dikembalikan"
//     case 6:
//       return "terlambat"
//   }
// }
const formatPhoneNumber = (phoneNo: string | null): string => {
  if (!phoneNo) return ""
  return phoneNo.replace(/^0/, "62")
}
</script>

<template>
  <div v-if="!pengguna" class="max-w-100ch mx-auto">
    <h1>pengguna tidak ditemukan!</h1>

    <PageHeader heading="gagal memuat pengguna!">
      <p>Silahkan coba lagi.</p>
    </PageHeader>
  </div>

  <div v-else class="max-w-[100ch] mx-auto">
    <CTA as="router-link" link to="/admin/pengguna" label="Kembali" class="order-first px-0">
      <IconArrowLeft />
    </CTA>
    <PageHeader :heading="pengguna.nama">
      <p>kelas: {{ pengguna.kelas ? pengguna.kelas : "tidak ada kelas" }}</p>
      <p>jurusan: {{ pengguna.jurusan ? pengguna.jurusan : "tidak ada jurusan" }}</p>
      <p>
        Nomor telepon:
        <span v-if="!pengguna.phone_no">tidak ada nomor telepon</span>
        <a
          v-else
          :href="`https://wa.me/${formatPhoneNumber(pengguna.phone_no)}`"
          class="hover:underline text-green-700"
          target="_blank"
        >
          {{ pengguna.phone_no }}
        </a>
      </p>
    </PageHeader>

    <Divider />

    <section class="main-section">
      <DataTable :value="peminjaman" striped-rows>
        <template #header>
          <p>Data peminjaman untuk {{ pengguna.nama }}</p>
        </template>

        <Column header="Buku">
          <template #body="{ data }">
            {{ data.buku.judul }}
          </template>
        </Column>

        <Column header="tanggal pinjam">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            {{ getPeminjamanStateDate(data, 1) }}
          </template>
        </Column>

        <Column header="tenggat waktu">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            {{ formatDate(new Date(data.tenggat_waktu)) }}
          </template>
        </Column>

        <Column header="tanggal kembali">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            <span v-if="data.peminjaman_detail[0].state_id === 6"> terlambat </span>
            <span v-else>
              {{ getPeminjamanStateDate(data, 5) }}
            </span>
          </template>
        </Column>

        <Column header="keterangan">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            {{ data.peminjaman_detail[0].peminjaman_state?.name }}
          </template>
        </Column>
      </DataTable>
    </section>

    <Divider />
    <section class="main-section">
      <DataTable :value="kunjungan" striped-rows>
        <template #header>
          <p>Riwayat kunjungan untuk {{ pengguna.nama }}</p>
        </template>

        <Column header="Waktu">
          <template #body="{ data }">
            {{ formatDate(new Date(data.timestamp), { dateStyle: "long", timeStyle: "short" }) }}
          </template>
        </Column>

        <Column header="Event">
          <template #body="{ data }">
            {{ data.event.replace("_", " ") }}
          </template>
        </Column>
      </DataTable>
    </section>
    <Divider />
    <section class="main-section">
      <h2 class="text-lg font-bold">Aksi</h2>

      <div class="flex flex-col items-start gap-4">
        <CTA label="edit" />
        <CTA label="kirimkan email reset password" />
        <CTA label="hapus" severity="danger" />
      </div>
    </section>
  </div>
</template>
