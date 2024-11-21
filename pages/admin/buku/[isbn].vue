<script setup lang="ts">
import Toast from "primevue/toast"
import ConfirmPopup from "primevue/confirmpopup"
import { StorageError } from "@supabase/storage-js"
import type { PostgrestError } from "@supabase/supabase-js"
import Select from "primevue/select"
import type { Database } from "~/types/database.types.ts"
import IconArrowLeft from "~icons/mdi/arrow-left"
import type { Buku } from "~/types"
import { InputText, InputNumber } from "primevue"

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)

const router = useRouter()
const currentRoute = useRoute()

const isbn = currentRoute.params.isbn

const { data: buku } = await useLazyAsyncData(async () => {
  const { data, error } = await supabase
    .from("buku")
    .select("*, kategori_buku(kategori)")
    .eq("no_isbn", isbn)
    .single()

  if (error) {
    console.error(error.message)
    throw error
  }

  return data
})

const { data: availableCategories } = await useLazyAsyncData(
  async () => await getAllAvailableCategories()
)

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

    toast.add({
      severity: "success",
      summary: "sukses mengubah data buku!",
      life: 5000,
    })
  } catch (err) {
    console.trace((err as PostgrestError).message)
  }
}

const toast = useToast()
const confirm = useConfirm()

async function confirmDeleteBuku(no_isbn: Buku["no_isbn"]) {
  confirm.require({
    message: "Apakah anda benar-benar ingin menghapus buku?",
    accept: () => deleteBook(no_isbn),
  })
}

async function deleteBook(isbn: string) {
  isLoading.value = true
  try {
    const { error } = await supabase.from("buku").delete().eq("no_isbn", isbn)
    if (error) throw error

    const response = await supabase.storage.from("Buku").remove([`${isbn}/${isbn}`])
    if (response.error) throw response.error
    if (error) throw error

    toast.add({
      severity: "success",
      summary: "Buku sukses dihapus.",
      detail: "Sukses menghapus buku",
      life: 5000,
    })
  } catch (err) {
    let summary = "Gagal menghapus gambar sampul buku!"
    let detail = "Kesalahan terjadi saat menghapus data buku. Silahkan coba lagi."
    console.trace(err)

    if (err instanceof StorageError) {
      summary = "Gagal menghapus gambar sampul buku!"
      detail =
        "Kesalahan terjadi saat menghapus gambar sampul buku. Silahkan coba lagi dalam beberapa saat."
    }

    return toast.add({
      severity: "error",
      summary,
      detail,
      life: 10000,
    })
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

  <div v-else class="main-section">
    <article v-if="!formIsVisible" class="buku">
      <PageHeader :heading="`${buku.judul} - ${buku.jumlah_exspl}`">
        <CTA label="kembali" link class="order-first" @click="router.back()">
          <IconArrowLeft />
        </CTA>
      </PageHeader>

      <p>{{ buku.penulis }}</p>
      <p>{{ buku.asal }}</p>
      <p>{{ buku.penerbit }}</p>
      <p>{{ buku.tahun_terbit }} - {{ buku.alamat_terbit }}</p>
      <p>{{ buku.kategori_buku?.kategori }}</p>
    </article>

    <article v-else class="buku">
      <header class="flex flex-col gap-2 mb-2">
        <h1 class="text-2xl font-bold">Edit</h1>
        <CTA label="kembali" class="w-fit justify-start text-sm p-1" @click="toggleFormVisibility">
          <IconArrowLeft />
        </CTA>
      </header>
      <section class="flex flex-col justify-center lg:flex-row gap-4 lg:gap-6 main-section">
        <!-- ISI V-IF NYA DI SINI YA @KLRFL -->
        <figure
          class="mx-auto lg:m-0 max-w-60 aspect-[2/3] align-self-start border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-800"
        >
          <img
            width="150"
            height="800"
            class="size-full object-cover aspect-auto"
            :alt="`gambar buku ${buku?.judul}`"
          />
          <p class="text-center text-gray-600 dark:text-gray-400">
            Gambar buku akan muncul di sini.
          </p>
        </figure>
        <form
          class="buku-edit grid grid-cols-1 sm:grid-cols-2 gap-4"
          @submit.prevent="editBook(buku)"
        >
          <label for="buku-judul" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Judul</span>
            <InputText
              id="buku-judul"
              v-model="buku.judul"
              type="text"
              name="buku-judul"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-asal" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Asal</span>
            <InputText
              id="buku-asal"
              v-model="buku.asal"
              type="text"
              name="buku-asal"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-penulis" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">ISBN</span>
            <InputText
              id="buku-isbn"
              v-model="buku.no_isbn"
              type="text"
              name="buku-isbn"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-penulis" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Penulis</span>
            <InputText
              id="buku-penulis"
              v-model="buku.penulis"
              type="text"
              name="buku-penulis"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>

          <label for="buku-penerbit" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Penerbit</span>
            <InputText
              id="buku-penerbit"
              v-model="buku.penerbit"
              type="text"
              name="buku-penerbit"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-tahun-terbit" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Tahun terbit</span>
            <InputText
              id="buku-tahun-terbit"
              v-model="buku.tahun_terbit"
              type="text"
              name="buku-tahun-terbit"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-alamat-terbit" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Alamat terbit</span>
            <InputText
              id="buku-alamat-terbit"
              v-model="buku.alamat_terbit"
              type="text"
              name="buku-alamat-terbit"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-jumlah" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Jumlah</span>
            <InputNumber
              id="buku-jumlah"
              v-model="buku.jumlah_exspl"
              :invalid="0 > buku.jumlah_exspl || buku.jumlah_exspl > 1000"
              name="buku-jumlah"
              required
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <label for="buku-kategori" class="flex flex-col">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Kategori</span>
            <Select
              v-model="buku.kategori_id"
              placeholder="Pilih kategori"
              :options="availableCategories ?? []"
              checkmark
              option-label="kategori"
              option-value="id"
              class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </label>
          <CTA type="submit" label="Simpan perubahan" class="sm:col-span-2" />
        </form>
      </section>
    </article>
    <div class="button-container">
      <CTA severity="danger" label="Hapus" @click="confirmDeleteBuku(buku.no_isbn)" />
      <CTA v-show="!formIsVisible" label="Sunting" @click="toggleFormVisibility" />

      <ConfirmPopup />
    </div>
  </div>

  <Toast />
</template>
