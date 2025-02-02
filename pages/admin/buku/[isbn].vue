<script setup lang="ts">
import Toast from "primevue/toast"
import ConfirmPopup from "primevue/confirmpopup"
import FileUpload from "primevue/fileupload"
import { InputText, InputNumber } from "primevue"
import { StorageError } from "@supabase/storage-js"
import type { PostgrestError } from "@supabase/supabase-js"
import Select from "primevue/select"
import type { Database } from "~/types/database.types.ts"
import IconArrowLeft from "~icons/mdi/arrow-left"
import type { Buku } from "~/types"
import { schema, resolver, uploadBookImage } from "~/lib/buku"
import type { FormSubmitEvent } from "@primevue/forms"

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

const { newImage, previewURL, previewImage } = usePreviewImage()
const imgURL = ref(getBukuImage(buku.value?.image))

async function editBook({ valid, values }: FormSubmitEvent) {
  if (!valid) return

  const { data: buku, success, error } = schema.safeParse(values)

  if (!buku || !success) {
    console.log(error)

    return toast.add({
      severity: "error",
      summary: "gagal menyunting data buku.",
      detail: "gagal menyunting data buku. Silahkan coba lagi dalam beberapa saat",
      life: 10000,
    })
  }

  try {
    if (newImage.value) {
      const uploadError = await uploadBookImage(buku.no_isbn, newImage.value)
      if (uploadError) throw uploadError
    }

    const { error } = await supabase
      .from("buku")
      .update({ ...buku, image: `public/${buku.no_isbn}` })
      .eq("no_isbn", isbn)
    if (error) throw error

    toast.add({
      severity: "success",
      summary: "sukses mengubah data buku!",
      life: 5000,
    })
  } catch (err) {
    console.trace((err as PostgrestError).message)

    if (err instanceof StorageError) {
      return toast.add({
        severity: "error",
        summary: "gagal mengunggah gambar buku!",
        detail: "gagal mengunggah gambar buku, Silahkan coba lagi.",
        life: 10000,
      })
    }

    return toast.add({
      severity: "error",
      summary: "gagal menyunting data buku!",
      detail: "gagal menyunting data buku. Silahkan coba lagi dalam beberapa saat.",
      life: 10000,
    })
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

    const response = await supabase.storage.from("Buku").remove([`public/${isbn}`])
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
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <header v-if="!buku">
    <h1>Ada yang salah!</h1>
    <p>Silahkan coba lagi dalam beberapa saat.</p>
  </header>

  <template v-else>
    <PageHeader :heading="`Menyunting ${buku.judul}`">
      <CTA label="kembali" link class="order-first" @click="router.go(-1)">
        <IconArrowLeft />
      </CTA>
    </PageHeader>

    <section class="flex flex-col justify-center lg:flex-row gap-4 lg:gap-6 main-section">
      <figure
        class="mx-auto lg:m-0 max-w-60 aspect-[2/3] border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden grid place-content-center bg-gray-100 dark:bg-gray-800"
      >
        <img
          v-if="newImage || imgURL"
          :src="previewURL === '' ? (imgURL as string) : previewURL"
          width="300"
          height="450"
          class="size-full object-cover aspect-auto"
          :alt="`gambar buku ${buku?.judul}`"
        />
        <p v-else class="text-center text-gray-600 dark:text-gray-400">
          Gambar buku akan muncul di sini.
        </p>
      </figure>

      <Form
        v-slot="$form"
        class="buku-edit grid grid-cols-1 sm:grid-cols-2 gap-4"
        validate-on-submit
        :validate-on-value-update="false"
        validate-on-blur
        :resolver
        :initial-values="buku"
        @submit="editBook"
      >
        <label for="buku-gambar">
          <span>Gambar buku</span>
          <FileUpload
            id="buku-gambar"
            ref="buku-gambar"
            mode="basic"
            name="image"
            accept="image/*"
            class="w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
            :default-value="buku.judul"
            type="text"
            name="judul"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <Message v-if="$form.judul?.invalid" severity="error" size="small" variant="simple">
            {{ $form.judul?.error.message }}
          </Message>
        </label>

        <label for="buku-asal" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Asal</span>
          <InputText
            id="buku-asal"
            type="text"
            name="asal"
            :default-value="buku.asal"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <Message v-if="$form.asal?.invalid" severity="error" size="small" variant="simple">
            {{ $form.asal?.error.message }}
          </Message>
        </label>

        <label for="buku-penulis" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">ISBN</span>
          <InputText
            id="buku-isbn"
            type="text"
            name="no_isbn"
            :default-value="buku.no_isbn"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message v-if="$form.no_isbn?.invalid" severity="error" size="small" variant="simple">
            {{ $form.no_isbn?.error.message }}
          </Message>
        </label>

        <label for="buku-penulis" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Penulis</span>
          <InputText
            id="buku-penulis"
            :default-value="buku.penulis"
            type="text"
            name="penulis"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message v-if="$form.penulis?.invalid" severity="error" size="small" variant="simple">
            {{ $form.penulis?.error.message }}
          </Message>
        </label>

        <label for="buku-penerbit" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Penerbit</span>
          <InputText
            id="buku-penerbit"
            type="text"
            :default-value="buku.penerbit"
            name="penerbit"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message v-if="$form.penerbit?.invalid" severity="error" size="small" variant="simple">
            {{ $form.penerbit?.error.message }}
          </Message>
        </label>

        <label for="buku-tahun-terbit" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Tahun terbit</span>
          <InputText
            id="buku-tahun-terbit"
            type="text"
            :default-value="buku.tahun_terbit"
            name="tahun_terbit"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message
            v-if="$form.tahun_terbit?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.tahun_terbit?.error.message }}
          </Message>
        </label>

        <label for="buku-alamat-terbit" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Alamat terbit</span>
          <InputText
            id="buku-alamat-terbit"
            type="text"
            :default-value="buku.alamat_terbit"
            name="alamat_terbit"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message
            v-if="$form.alamat_terbit?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.alamat_terbit?.error.message }}
          </Message>
        </label>

        <label for="buku-jumlah" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Jumlah</span>
          <InputNumber
            id="buku-jumlah"
            :invalid="0 > buku.jumlah_exspl || buku.jumlah_exspl > 1000"
            :default-value="buku.jumlah_exspl"
            name="jumlah_exspl"
            fluid
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message
            v-if="$form.jumlah_exspl?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.jumlah_exspl?.error.message }}
          </Message>
        </label>

        <label for="buku-kategori" class="flex flex-col">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Kategori</span>
          <Select
            placeholder="Pilih kategori"
            :options="availableCategories ?? []"
            checkmark
            :default-value="buku.kategori_id"
            name="kategori_id"
            option-label="kategori"
            option-value="id"
            class="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Message v-if="$form.kategori_id?.invalid" severity="error" size="small" variant="simple">
            {{ $form.kategori_id?.error.message }}
          </Message>
        </label>

        <CTA type="submit" label="Simpan perubahan" class="sm:col-span-2" :loading="isLoading" />
      </Form>
    </section>

    <div class="button-container">
      <CTA severity="danger" label="Hapus" @click="confirmDeleteBuku(buku.no_isbn)" />

      <ConfirmPopup />
    </div>
  </template>

  <Toast />
</template>
