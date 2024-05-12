<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/lib/supabase"
import type {
  PostgrestError,
  QueryData,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataRow from "@/components/admin/DataRow.vue"
import TheDialog from "@/components/TheDialog.vue"
import { useDialog } from "@/lib/composables"
import { confirmBorrowBuku, confirmReturnBuku } from "@/lib/utils"

const isLoading = ref(false)
const { dialog } = useDialog()

const peminjamanDataQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama, kelas, jurusan), buku(*)")
export type PeminjamanData = QueryData<typeof peminjamanDataQuery>

const peminjamanData = ref<PeminjamanData>([])

async function getPeminjamanData() {
  try {
    const { data, error } = await peminjamanDataQuery
    if (error) throw error
    return data
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}

const bukusBorrowPending = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 1)
})

const bukusBorrowConfirmed = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 2)
})

const bukusReturnPending = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 4)
})

onMounted(async () => {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData()
  isLoading.value = false
})

async function konfirmasiPeminjaman(id: Peminjaman["id"]) {
  try {
    if (!confirm("beneran nih mau konfirmasi peminjaman buku")) return
    await confirmBorrowBuku(id)

    dialog.value.open(`Sukses mengkonfirmasi peminjaman buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

async function konfirmasiPengembalian(dataPeminjaman: Peminjaman, buku: Buku) {
  try {
    await confirmReturnBuku(dataPeminjaman, buku, new Date())

    dialog.value.open(`Sukses mengkonfirmasi pengembalian buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

async function insertPeminjamandata(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("pengguna(nama, kelas, jurusan), buku(*)")
      .eq("id", (payload.new as Peminjaman).id)
      .single()
    if (error) throw error

    // merge data from payload and data from fetch
    if (data) peminjamanData.value.push({ ...(payload.new as Peminjaman), ...data })
  } catch (err) {
    console.error(err)
  }
}

function updatePeminjamanData(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  const targetData = peminjamanData.value!.find(
    (data) => data.id === (payload.new as Peminjaman).id
  )
  if (targetData) targetData.state_id = (payload.new as Peminjaman).state_id
}

supabase
  .channel("new_peminjaman")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "peminjaman" },
    insertPeminjamandata
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "peminjaman" },
    updatePeminjamanData
  )
  .subscribe()
</script>

<template>
  <h1>Admin</h1>
  <p>Halo admin</p>

  <LoadingSpinner v-if="isLoading" />
  <section
    v-else
    class="main-section"
  >
    <h2>Buku yang belum dikonfirmasi</h2>
    <ul class="data-list">
      <li v-if="bukusBorrowPending && !bukusBorrowPending.length">
        belum ada bukunya
      </li>
      <DataRow
        v-for="data in bukusBorrowPending"
        :key="data.id"
        :data="data"
        :buku="data.buku"
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.id)"
      />
    </ul>

    <h2>Buku yang sedang dipinjam</h2>
    <ul class="data-list">
      <li v-if="bukusBorrowConfirmed && !bukusBorrowConfirmed.length">
        belum ada bukunya
      </li>
      <DataRow
        v-for="data in bukusBorrowConfirmed"
        :key="data.id"
        :data="data"
        :buku="data.buku"
      />
    </ul>

    <h2>Buku untuk dikembalikan</h2>
    <ul class="data-list">
      <li v-if="bukusReturnPending && !bukusReturnPending.length">
        belum ada bukunya
      </li>
      <DataRow
        v-for="data in bukusReturnPending"
        :key="data.id"
        :data="data"
        :buku="data.buku"
        @konfirmasi-pengembalian="konfirmasiPengembalian(data, data.buku!)"
      />
    </ul>
  </section>

  <TheDialog
    :is-open="dialog.isOpen"
    :dialog-close="dialog.close"
  >
    <h2>Sukses!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>

<style scoped>
.data-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50ch, 1fr));
  gap: 1rem;
}
</style>
