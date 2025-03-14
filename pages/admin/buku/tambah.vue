<script setup lang="ts">
import { useDialog } from "@/composables"
import Select from "primevue/select"
import { StorageError } from "@supabase/storage-js"
import type { PostgrestError } from "@supabase/supabase-js"
import IconArrowLeft from "~icons/mdi/arrow-left"
import { InputText, InputNumber, FileUpload } from "primevue"
import type { FormSubmitEvent } from "@primevue/forms"
import { schema, resolver, uploadBookImage } from "~/lib/buku"

useHead({
  title: "Tambah Buku",
})

definePageMeta({
  layout: "admin",
})

const isLoading = ref(false)
const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

const { newImage, previewURL, previewImage } = usePreviewImage()

async function addNewBook({ valid, values }: FormSubmitEvent) {
  if (!valid) return

  isLoading.value = true

  const { data: buku, success, error } = schema.safeParse(values)
  if (!buku || (buku && !success)) {
    isLoading.value = false

    console.log(error)

    return toast.add({
      severity: "error",
      summary: "Gagal menambahkan buku",
      detail: "gagal menambahkan buku. Silahkan refresh atau coba lagi dalam beberapa saat.",
      life: 10000,
    })
  }

  try {
    // upload image if admin puts an image
    if (newImage.value) {
      const uploadError = await uploadBookImage(buku.no_isbn, newImage.value)
      if (uploadError) throw uploadError
    }

    const slug = slugify(buku.judul)
    const insertError = await insertBookData({ ...buku, slug, image: `public/${buku.no_isbn}` })
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
const { loadingText: tambahBtnLabel } = useLoadingText(isLoading, "Tambah buku", "Menambahkan buku")

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

  <section class="flex flex-col justify-center lg:flex-row gap-4 lg:gap-6 main-section">
    <figure
      class="mx-auto lg:m-0 max-w-60 aspect-[2/3] align-self-start border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-800"
    >
      <img
        v-if="newImage"
        :src="previewURL"
        width="150"
        height="800"
        class="size-full object-cover aspect-auto"
      />
      <p v-else class="text-center text-gray-600 dark:text-gray-400">
        Gambar buku akan muncul di sini.
      </p>
    </figure>

    <Form
      v-slot="$form"
      :resolver
      :validate-on-blur="true"
      :validate-on-submit="true"
      :validate-on-value-update="false"
      class="flex flex-col gap-4 md:grid md:grid-cols-2"
      @submit="addNewBook"
    >
      <label for="buku-gambar" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Gambar buku</span>
        <FileUpload
          id="buku-gambar"
          ref="buku-gambar"
          name="image"
          mode="basic"
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

        <Message v-if="$form.judul?.invalid" severity="error" size="small" variant="simple">
          {{ $form.judul?.error.message }}
        </Message>
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

        <Message v-if="$form.no_isbn?.invalid" severity="error" size="small" variant="simple">
          {{ $form.no_isbn?.error.message }}
        </Message>
      </label>

      <label for="buku-kategori" class="flex flex-col">
        <span class="font-semibold text-gray-700 dark:text-gray-300">Kategori</span>
        <Select
          name="kategori_id"
          placeholder="Pilih kategori"
          :options="availableCategories ?? []"
          checkmark
          option-label="kategori"
          option-value="id"
          fluid
          class="rounded-md border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <Message v-if="$form.kategori_id?.invalid" severity="error" size="small" variant="simple">
          {{ $form.kategori_id?.error.message }}
        </Message>
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
        <Message v-if="$form.penulis?.invalid" severity="error" size="small" variant="simple">
          {{ $form.penulis?.error.message }}
        </Message>
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
        <Message v-if="$form.penerbit?.invalid" severity="error" size="small" variant="simple">
          {{ $form.penerbit?.error.message }}
        </Message>
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

        <Message v-if="$form.tahun_terbit?.invalid" severity="error" size="small" variant="simple">
          {{ $form.tahun_terbit?.error.message }}
        </Message>
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

        <Message v-if="$form.alamat_terbit?.invalid" severity="error" size="small" variant="simple">
          {{ $form.alamat_terbit?.error.message }}
        </Message>
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

        <Message v-if="$form.asal?.invalid" severity="error" size="small" variant="simple">
          {{ $form.asal?.error.message }}
        </Message>
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

        <Message v-if="$form.jumlah_exspl?.invalid" severity="error" size="small" variant="simple">
          {{ $form.jumlah_exspl?.error.message }}
        </Message>
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

      <TheDialog :is-open="dialog.isOpen" @dialog-close="router.push(`/admin/buku/`)">
        <h2>Sukses!</h2>
        <p>{{ dialog.message }}</p>
      </TheDialog>
    </Form>
  </section>

  <Toast />
</template>
