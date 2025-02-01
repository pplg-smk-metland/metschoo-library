<script setup lang="ts">
import { useBuku, useDialog } from "@/composables"
import Select from "primevue/select"
import { StorageError } from "@supabase/storage-js"
import type { Buku } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"
import IconArrowLeft from "~icons/mdi/arrow-left"
import type { Database } from "~/types/database.types.ts"
import { InputText, InputNumber, FileUpload } from "primevue"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"

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

const { newImage, previewURL, previewImage } = usePreviewImage()

async function uploadBookImage(isbn: string, file: File) {
  if (!buku.value) return console.trace("buku gak ada????")

  buku.value.image = `public/${isbn}`
  const { error } = await supabase.storage.from("Buku").upload(buku.value.image, file, {
    upsert: true,
  })
  return error
}

const schema = z.object({
  judul: z.string(),
  no_isbn: z.string(),
  kategori_id: z.number(),
  asal: z.string(),
  jumlah_exspl: z
    .number()
    .min(0, "jumlah harus 0 atau lebih.")
    .max(10000, "banyak amat sih ga mungkin lah bukunya segitu."),
  penerbit: z.string(),
  alamat_terbit: z.string(),
  tahun_terbit: z.string().regex(/\d{0,4}/, { message: "tahun terbit harus memiliki 4 digit." }),
  penulis: z.string(),
})

const resolver = zodResolver(schema)

async function addNewBook(buku: Buku) {
  isLoading.value = true

  const { no_isbn } = buku

  try {
    if (newImage.value) {
      const uploadError = await uploadBookImage(no_isbn, newImage.value)
      if (uploadError) throw uploadError
    }

    const insertError = await insertBookData(buku)
    if (insertError) throw insertError

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

// silly loading animation
const tambahBtnLabel = ref("Tambah buku baru")
const labelRepeat = ref(0)
let intervalID: NodeJS.Timeout | undefined = undefined

watch(isLoading, (newIsLoading) => {
  tambahBtnLabel.value = newIsLoading ? "Menambahkan buku baru" : "Tambah buku baru"

  if (newIsLoading) {
    intervalID = setInterval(() => {
      tambahBtnLabel.value = "Menambahkan buku baru" + ".".repeat(labelRepeat.value)
      labelRepeat.value += 1
      if (labelRepeat.value > 3) labelRepeat.value = 0
    }, 500)
  } else {
    labelRepeat.value = 0
    clearInterval(intervalID)
    intervalID = undefined
  }
})

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

  <section v-else class="flex flex-col justify-center lg:flex-row gap-4 lg:gap-6 main-section">
    <figure
      class="mx-auto lg:m-0 max-w-60 aspect-[2/3] align-self-start border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-800"
    >
      <img
        v-if="newImage"
        :src="previewURL"
        width="150"
        height="800"
        class="size-full object-cover aspect-auto"
        :alt="`gambar buku ${buku?.judul}`"
      />
      <p v-else class="text-center text-gray-600 dark:text-gray-400">
        Gambar buku akan muncul di sini.
      </p>
    </figure>

    <Form
      v-slot="$form"
      :resolver="resolver"
      :validate-on-blur="true"
      :validate-on-submit="true"
      :validate-on-value-update="false"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      @submit="addNewBook(buku)"
    >
      <label for="buku-gambar" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Gambar buku</span>
        <FileUpload
          id="buku-gambar"
          ref="buku-gambar"
          mode="basic"
          name="buku-gambar"
          accept="image/*"
          class="rounded-md w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          custom-upload
          auto
          @select="previewImage"
          @change="previewImage"
        />
      </label>

      <label for="buku-judul" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Judul</span>
        <InputText
          id="buku-judul"
          type="text"
          name="judul"
          placeholder="judul buku"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-isbn" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">ISBN</span>
        <InputText
          id="buku-isbn"
          type="text"
          name="no_isbn"
          placeholder="ISBN buku"
          fluid
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
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-penulis" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Penulis</span>
        <InputText
          id="buku-penulis"
          type="text"
          name="penulis"
          placeholder="penulis buku"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-penerbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Penerbit</span>
        <InputText
          id="buku-penerbit"
          type="text"
          name="penerbit"
          placeholder="penerbit"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-tahun-terbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Tahun terbit</span>
        <InputText
          id="buku-tahun-terbit"
          type="text"
          name="tahun_terbit"
          placeholder="tahun terbit"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-alamat-terbit" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Alamat terbit</span>
        <InputText
          id="buku-alamat-terbit"
          type="text"
          name="alamat_terbit"
          placeholder="alamat terbit"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-asal" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Asal</span>
        <InputText
          id="buku-asal"
          type="text"
          name="asal"
          placeholder="asal buku"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <label for="buku-jumlah" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Jumlah</span>
        <InputNumber
          id="buku-jumlah"
          name="jumlah_exspl"
          placeholder="jumlah buku"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </label>

      <CTA
        type="submit"
        :disabled="isLoading"
        :loading="isLoading"
        :label="tambahBtnLabel"
        class="sm:col-span-2"
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
    </Form>
  </section>
</template>
