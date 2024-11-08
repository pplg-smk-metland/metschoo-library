<script setup lang="ts">
import { formatDate } from "#imports"
import type { Peminjaman } from "~/types"
import type { Database } from "~/types/database.types"

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
    .select("*, buku(judul)")
    .order("tgl_pinjam", { ascending: true })
    .eq("user_id", userId)

  if (error) throw error
  return data
})

// TODO: pindah ke database
const keteranganText = (state_id: Peminjaman["state_id"]) => {
  switch (state_id) {
    case 1:
      return "menunggu konfirmasi"
    case 2:
      return "sedang dipinjam"
    case 3:
      return "dibatalkan"
    case 4:
      return "menunggu konfirmasi pengembalian"
    case 5:
      return "dikembalikan"
    case 6:
      return "terlambat"
  }
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
    <PageHeader :heading="pengguna.nama">
      <routerLink to="/admin/pengguna">kembali</routerLink>

      <p>kelas: {{ pengguna.kelas ? pengguna.kelas : "tidak ada kelas" }}</p>
      <p>jurusan: {{ pengguna.jurusan ? pengguna.jurusan : "tidak ada jurusan" }}</p>
    </PageHeader>

    <Divider />

    <section class="main-section">
      <DataTable :value="peminjaman" striped-rows>
        <template #header>
          <p>Data peminjaman untuk {{ pengguna.nama }}</p>
        </template>

        <Column header="Buku">
          <template #body="slotProps">
            {{ slotProps.data.buku.judul }}
          </template>
        </Column>

        <Column header="tanggal pinjam">
          <template #body="slotProps">
            {{ formatDate(new Date(slotProps.data.tgl_pinjam)) }}
          </template>
        </Column>

        <Column header="tenggat waktu">
          <template #body="slotProps">
            {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
          </template>
        </Column>

        <Column header="tanggal kembali">
          <template #body="{ data }">
            <span
              v-if="new Date(data.tenggat_waktu).getTime() < new Date(data.tgl_pinjam).getTime()"
            >
              terlambat
            </span>
            <span v-else>
              {{ data.tgl_kembali ? formatDate(new Date(data.tgl_kembali)) : "-" }}
            </span>
          </template>
        </Column>

        <Column header="keterangan">
          <template #body="slotProps">
            {{ keteranganText(slotProps.data.state_id) }}
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
