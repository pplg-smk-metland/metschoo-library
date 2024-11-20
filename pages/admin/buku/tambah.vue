<script setup lang="ts">
import { useBuku, useDialog } from "@/composables"
import Select from "primevue/select"
import { StorageError } from "@supabase/storage-js"
import type { Buku } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"
import IconArrowLeft from "~icons/mdi/arrow-left"
import type { Database } from "~/types/database.types.ts"
import { InputText, InputNumber } from "primevue"

useHead({
  title: "Tambah Buku",
})

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()
const { buku } = useBuku()

const isLoading = ref(false)
const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

const bukuGambarEl = ref<HTMLInputElement | null>(null)
const bukuGambarURL = ref("")
const bukuGambarFile = ref()

function previewBookImage(bukuGambarEl: HTMLInputElement) {
  bukuGambarFile.value = bukuGambarEl.files?.[0]
  bukuGambarURL.value = URL.createObjectURL(bukuGambarFile.value)
}

async function uploadBookImage(isbn: string, file: File) {
  isLoading.value = true
  try {
    const { error } = await supabase.storage.from("Buku").upload(`public/${isbn}`, file, {
      upsert: false,
    })
    return error
  } finally {
    isLoading.value = false
  }
}

async function insertBookData(buku: Buku) {
  const { error } = await supabase.from("buku").insert({ ...buku })
  return error
}

async function addNewBook(buku: Buku) {
  isLoading.value = true

  const { no_isbn } = buku

  try {
    const insertError = await insertBookData(buku)
    if (insertError) throw insertError

    const uploadError = await uploadBookImage(no_isbn, bukuGambarFile.value)
    if (uploadError) throw uploadError
    dialog.value.open("Buku berhasil ditambahkan!")
  } catch (error) {
    console.table(error as Error)

    let message: string
    if (error instanceof StorageError) {
      message = `Ada kesalahan saat mengunggah sampul buku. Silahkan coba lagi dalam beberapa saat. ${error.message}`
    } else {
      message = `Ada kesalahan saat mengunggah buku. Mungkin ISBNnya sudah ada? ${
        (error as PostgrestError).message
      }`
    }

    errDialog.value.open(message)
  } finally {
    isLoading.value = false
  }
}

const { data: availableCategories } = await useAsyncData(
  async () => await getAllAvailableCategories()
)

const toast = useToast()

onMounted(async () => {
  if (!availableCategories.value) {
    toast.add({
      severity: "error",
      summary: "Gagal membuat kategori",
      detail: "gagal memuat kategori. Silahkan refresh atau coba lagi dalam beberapa saat.",
      life: 10000,
    })
  }
})

const router = useRouter()
</script>

<template>
  <PageHeader heading="Tambah buku">
    <CTA label="kembali" link class="order-first" @click="router.go(-1)">
      <IconArrowLeft />
    </CTA>
  </PageHeader>

  <section v-if="!buku">
    <p>Ada kesalahan saat mengambil data buku. Silahkan coba lagi</p>
  </section>

  <section v-else class="grid gap-4 lg:gap-6 lg:grid-cols-2 buku-container main-section">
    <figure
      class="border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-800"
    >
      <img
        v-if="bukuGambarEl && bukuGambarFile"
        :src="bukuGambarURL"
        width="150"
        height="800"
        :alt="`gambar buku ${buku?.judul}`"
      />
      <p v-else class="text-center text-gray-600 dark:text-gray-400">
        Gambar buku akan muncul di sini.
      </p>
    </figure>

    <form class="grid grid-cols-1 lg:grid-cols-2 gap-4" @submit.prevent="addNewBook(buku)">
      <label for="buku-gambar" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Gambar buku</span>
        <InputText
          id="buku-gambar"
          ref="bukuGambarEl"
          type="file"
          name="buku-gambar"
          accept="image/*"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          @change="previewBookImage(bukuGambarEl!)"
        />
      </label>

      <label for="buku-judul" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Judul</span>
        <InputText
          id="buku-judul"
          v-model="buku.judul"
          type="text"
          name="buku-judul"
          placeholder="judul buku"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-isbn" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">ISBN</span>
        <InputText
          id="buku-isbn"
          v-model="buku.no_isbn"
          type="text"
          name="buku-isbn"
          placeholder="ISBN buku"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-penulis" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Penulis</span>
        <InputText
          id="buku-penulis"
          v-model="buku.penulis"
          type="text"
          name="buku-penulis"
          placeholder="penulis buku"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-penerbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Penerbit</span>
        <InputText
          id="buku-penerbit"
          v-model="buku.penerbit"
          type="text"
          name="buku-penerbit"
          placeholder="penerbit"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-tahun-terbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Tahun terbit</span>
        <InputText
          id="buku-tahun-terbit"
          v-model="buku.tahun_terbit"
          type="text"
          name="buku-tahun-terbit"
          placeholder="tahun terbit"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-alamat-terbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Alamat terbit</span>
        <InputText
          id="buku-alamat-terbit"
          v-model="buku.alamat_terbit"
          type="text"
          name="buku-alamat-terbit"
          placeholder="alamat terbit"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-asal" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Asal</span>
        <InputText
          id="buku-asal"
          v-model="buku.asal"
          type="text"
          name="buku-asal"
          placeholder="asal buku"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-jumlah" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Jumlah</span>
        <InputNumber
          id="buku-jumlah"
          v-model="buku.jumlah_exspl"
          :min="0"
          :max="10000"
          name="buku-jumlah"
          placeholder="jumlah buku"
          required
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <CTA
        class="w-full col-span-1 lg:col-span-2"
        label="Simpan"
        type="submit"
        loading="isLoading"
        :disabled="isLoading"
      />
      <TheDialog :is-open="errDialog.isOpen" @dialog-close="errDialog.close()">
        <h2>Ada kesalahan!</h2>
        <p>{{ errDialog.message }}</p>
      </TheDialog>

      <TheDialog
        :is-open="dialog.isOpen"
        @dialog-close="router.push(`/admin/buku/${buku.no_isbn}`)"
      >
        <h2>Sukses!</h2>
        <p>{{ dialog.message }}</p>
      </TheDialog>
    </form>
  </section>
</template>
