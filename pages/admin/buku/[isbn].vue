<script setup lang="ts">
import { StorageError } from "@supabase/storage-js"
import { useDialog } from "@/composables"
import type { Kategori } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import type { Database } from "~/types/database.types.ts"
import IconArrowLeft from "~icons/mdi/arrow-left"

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)

const availableCategories = ref<Kategori[]>([])
const router = useRouter()
const currentRoute = useRoute()

const isbn = currentRoute.params.isbn
const bukuQuery = supabase
  .from("buku")
  .select("*, kategori_buku(kategori)")
  .eq("no_isbn", isbn)
  .single()

const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

type Buku = QueryData<typeof bukuQuery>
const buku = ref<Buku | null>(null)

async function ambilBuku(): Promise<Buku | null> {
  try {
    isLoading.value = true
    const { data, error } = await bukuQuery
    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    errDialog.value.open(`Buku dengan ISBN ${isbn} tidak ditemukan.`)
    return null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  buku.value = await ambilBuku()
  availableCategories.value = await getAllAvailableCategories()
})

async function editBook(buku: Buku) {
  try {
    const { error } = await supabase
      .from("buku")
      .update({
        judul: buku.judul,
        no_isbn: buku.no_isbn,
        penulis: buku.penulis,
        asal: buku.asal,
        kategori_id: buku.kategori_id,
        jumlah_exspl: buku.jumlah_exspl,
        penerbit: buku.penerbit,
        alamat_terbit: buku.alamat_terbit,
        tahun_terbit: buku.tahun_terbit,
      })
      .eq("no_isbn", isbn)
    if (error) throw error
  } catch (err) {
    console.trace((err as PostgrestError).message)
  }
}

async function deleteBook(isbn: string) {
  isLoading.value = true
  try {
    const { error } = await supabase.from("buku").delete().eq("no_isbn", isbn)
    if (error) throw error

    const response = await supabase.storage.from("Buku").remove([`${isbn}/${isbn}`])
    if (response.error) throw response.error
    if (error) throw error
    dialog.value.open("Buku sukses dihapus.")
  } catch (err) {
    if (err instanceof StorageError) {
      errDialog.value.open(
        "Kesalahan terjadi saat menghapus gambar sampul buku. Silahkan coba lagi dalam beberapa saat."
      )
      console.trace(err.message)
    }

    errDialog.value.open("Kesalahan terjadi saat menghapus data buku. Silahkan coba lagi.")
    console.trace(err as PostgrestError)
  } finally {
    isLoading.value = false
  }
}

const formIsVisible = ref(false)

function toggleFormVisibility() {
  formIsVisible.value = !formIsVisible.value
}
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <header v-if="!buku">
    <h1>Ada yang salah!</h1>
    <p>Silahkan coba lagi dalam beberapa saat.</p>
  </header>

  <div v-else class="wrapper">
    <article v-if="!formIsVisible" class="buku">
      <div class="flex gap-2 items-center my-5">
        <IconArrowLeft class="" />
        <CTA label="kembali" link class="pl-12 pl-0 relative right-10" @click="router.back()" />
      </div>
      <!-- yang ini -->
      <PageHeader :heading="`${buku.judul} - ${buku.jumlah_exspl}`"> </PageHeader>

      <p>{{ buku.penulis }}</p>
      <p>{{ buku.asal }}</p>
      <p>{{ buku.penerbit }}</p>
      <p>{{ buku.tahun_terbit }} - {{ buku.alamat_terbit }}</p>
      <p>{{ buku.kategori_buku?.kategori }}</p>
    </article>

    <article v-else class="buku">
      <header>
        <h1>Edit</h1>
        <button @click="toggleFormVisibility">Kembali</button>
      </header>

      <form class="buku-edit" @submit.prevent="editBook(buku)">
        <label for="buku-judul">Judul</label>
        <InputText id="buku-judul" v-model="buku.judul" type="text" name="buku-judul" required />
        <label for="buku-asal">Asal</label>
        <InputText id="buku-asal" v-model="buku.asal" type="text" name="buku-asal" required />
        <label for="buku-penulis">ISBN</label>
        <InputText id="buku-isbn" v-model="buku.no_isbn" type="text" name="buku-isbn" required />
        <label for="buku-penulis">Penulis</label>
        <InputText
          id="buku-penulis"
          v-model="buku.penulis"
          type="text"
          name="buku-penulis"
          required
        />
        <label for="buku-penerbit">Penerbit</label>
        <InputText
          id="buku-penerbit"
          v-model="buku.penerbit"
          type="text"
          name="buku-penerbit"
          required
        />
        <label for="buku-tahun-terbit">Tahun terbit</label>
        <InputText
          id="buku-tahun-terbit"
          v-model="buku.tahun_terbit"
          type="text"
          name="buku-tahun-terbit"
          required
        />
        <label for="buku-alamat-terbit">Alamat terbit</label>
        <InputText
          id="buku-alamat-terbit"
          v-model="buku.alamat_terbit"
          type="text"
          name="buku-alamat-terbit"
          required
        />
        <label for="buku-jumlah">Jumlah</label>
        <InputNumber
          id="buku-jumlah"
          v-model="buku.jumlah_exspl"
          :invalid="0 > buku.jumlah_exspl || buku.jumlah_exspl > 1000"
          name="buku-jumlah"
          required
        />
        <label for="buku-kategori">Kategori</label>
        <Select
          v-model="buku.kategori_id"
          placeholder="Pilih kategori"
          :options="availableCategories"
          checkmark
          option-label="kategori"
          option-value="id"
        />

        <CTA type="submit" label="Simpan perubahan" />
      </form>
    </article>

    <div class="button-container">
      <CTA severity="danger" label="Hapus" @click="deleteBook(buku.no_isbn)" />
      <CTA v-show="!formIsVisible" label="Sunting" @click="toggleFormVisibility" />
    </div>
  </div>

  <TheDialog :is-open="errDialog.isOpen" @dialog-close="router.push('/admin/buku')">
    <h2>Ada kesalahan!</h2>
    <p>
      {{ errDialog.message }}
    </p>
  </TheDialog>
  <TheDialog :is-open="dialog.isOpen" @dialog-close="router.push('/admin/buku/')">
    <h2>Sukses!</h2>
    <p>
      {{ dialog.message }}
    </p>
  </TheDialog>
</template>

<style scoped>
.buku-edit button {
  margin-block: 1rem;
}
</style>
