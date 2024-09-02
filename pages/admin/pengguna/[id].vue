<script setup lang="ts">
import { formatDate } from "#imports"
import type { Peminjaman, Pengguna } from "~/types"
import type { Database } from "~/types/database.types"

definePageMeta({
  layout: "default",
})

const route = useRoute()

const supabase = useSupabaseClient<Database>()

const isLoading = ref(false)
const pengguna = ref<Pengguna | null>(null)
const peminjaman = ref()

onMounted(async () => {
  isLoading.value = true
  const userId = route.params.id

  const { data, error } = await supabase.from("pengguna").select("*").eq("user_id", userId).single()
  if (error) {
    console.error(error)
  }

  pengguna.value = data

  const { data: peminjamanData } = await supabase
    .from("peminjaman")
    .select("*, buku(judul)")
    .eq("user_id", userId)
  peminjaman.value = peminjamanData

  isLoading.value = false
})
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <div v-if="!isLoading && !pengguna" class="max-w-100ch mx-auto">
    <h1>pengguna tidak ditemukan!</h1>
  </div>

  <div v-else class="max-w-[100ch] mx-auto">
    <PageHeader v-if="!pengguna" heading="gagal memuat pengguna!">
      <p>Silahkan coba lagi.</p>
    </PageHeader>

    <PageHeader v-else :heading="pengguna.nama">
      <p>{{ pengguna.kelas ? pengguna.kelas : "tidak ada kelas" }}</p>
      <p>{{ pengguna.jurusan ? pengguna.jurusan : "tidak ada jurusan" }}</p>
    </PageHeader>

    <Divider />

    <div class="main-section">
      <h2>Data peminjaman untuk {{ pengguna.nama }}</h2>

      <DataTable :value="peminjaman">
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
              {{ data.tgl_kembali ? formatDate(new Date(data.tgl_kembali)) : "belum dikembalikan" }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <section class="main-section">
      <h2>Aksi</h2>

      <div class="flex flex-col items-start gap-4">
        <CTA label="edit" />
        <CTA label="kirimkan email reset password" />
        <CTA label="hapus" severity="danger" />
      </div>
    </section>
  </div>
</template>
