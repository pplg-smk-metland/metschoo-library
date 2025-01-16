<script setup lang="ts">
import type { Database } from "~/types/database.types"
import Kategori from "./admin/buku/kategori.vue"

const { data } = await useAsyncData(() => getAllAvailableCategories())

const requestData = ref({
  title: "",
  isbn: "",
  category: "",
})

async function insertRequest() {
  const supabase = useSupabaseClient<Database>()

  // console.log({
  //   title: requestData.value.title,
  //   isbn: requestData.value.isbn,
  //   kategori: requestData.value.category.kategori,
  // })

  const { error } = await supabase.from("book_requests").insert({
    title: requestData.value.title,
    isbn: requestData.value.isbn,
    category: requestData.value.category.kategori,
  })

  if (error) console.log(error)
}
</script>

<template>
  <section class="max-w-xl m-auto">
    <header class="mb-4">
      <h1 class="font-bold">Formulir permintaan buku</h1>
      <p>
        Isi form berikut untuk mengbuat request buku baru yang akan ditambahkan ke metscoo library.
      </p>
      <p>
        kamu hanya bisa merequest satu buku perbulan dan request kamu akan diproses selama 14 hari
        kerja.
      </p>
    </header>

    <form class="flex flex-col gap-2 main-section" @submit.prevent="insertRequest">
      <label for="judul"> Judul </label>
      <InputText id="judul" v-model="requestData.title" type="text" placeholder="judul" required />

      <label for="isbn"> ISBN </label>

      <InputText id="isbn" v-model="requestData.isbn" type="text" placeholder="isbn" required />

      <label for="Kategori"> kategori </label>
      <Select
        v-if="data"
        v-model="requestData.category"
        :options="data"
        option-label="kategori"
        variant="filled"
        placeholder="Pilih kategori"
        class="w-full"
      ></Select>

      <Button type="submit"> Request </Button>
    </form>
  </section>
</template>
