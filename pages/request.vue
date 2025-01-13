<script setup lang="ts">
import Kategori from "./admin/buku/kategori.vue"

const { data, error } = await useAsyncData(() => getAllAvailableCategories())

const requestData = ref({
  judul: "",
  isbn: "",
  kategori: "",
})
</script>

<template>
  <section class="max-w-xl m-auto">
    <header class="mb-4">
    <h1 class="font-bold">Form request buku</h1>
    <p>
      Isi form berikut untuk mengbuat request buku baru yang akan ditambahkan ke metscoo library.
    </p>
    <p>kamu hanya bisa merequest satu buku perbulan dan request kamu akan diproses selama 14 hari kerja.</p>
    </header>
    <form class="flex flex-col gap-2 main-section">
      <label for="judul"> Judul </label>
      <InputText type="text" v-model="requestData.judul" placeholder="judul" required id="judul" />

      <label for="isbn"> ISBN </label>

      <InputText type="text" v-model="requestData.isbn" placeholder="isbn" required id="isbn" />

      <label for="Kategori"> kategori </label>
      <Select
        v-if="data"
        v-model="requestData.kategori"
        :options="data"
        option-label="kategori"
        variant="filled"
        placeholder="Pilih kategori"
        class="w-full"
      ></Select>

      <Button> Request </Button>
    </form>
  </section>
</template>
