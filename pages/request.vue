<script setup lang="ts">
import { Toast } from "primevue"
import { getUserRequest, insertRequest } from "@/lib/request"
import type { RequestData } from "~/types"

definePageMeta({
  title: "Request buku",
  middleware: "auth",
})

const toast = useToast()

const { data } = await useAsyncData(() => getAllAvailableCategories())

const user = useSupabaseUser()

const { data: latestRequest } = await useAsyncData(async () => {
  if (user.value) return await getUserRequest(user.value.id)
})

const canRequest = computed(() => {
  if (!latestRequest.value) return true

  const SecondDate = new Date().getTime() - new Date(latestRequest.value.created_at).getTime()
  const aDayInMs = 24 * 60 * 60 * 1000

  const olderThan30Days = Math.floor(SecondDate / aDayInMs) > 30
  return olderThan30Days
})

const requestData = ref<RequestData>({
  title: "",
  isbn: "",
  category: "",
})

async function handleInsertRequest(requestData: RequestData) {
  try {
    const data = await insertRequest(requestData)

    toast.add({
      severity: "success",
      summary: "menanbahkan request",
      detail: "sukses menanbahkan request buku, mohon ditunggu ya",
      life: 10000,
    })

    latestRequest.value = data
  } catch (err) {
    console.error(err)
    toast.add({
      severity: "error",
      summary: "gagal menambahkan buku",
      detail: "gagal menanbahkan request buku, silahkan coba lagi nanti",
      life: 10000,
    })
  }
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

    <form
      v-if="canRequest"
      class="flex flex-col gap-2 main-section"
      @submit.prevent="handleInsertRequest(requestData)"
    >
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
        option-value="kategori"
        variant="filled"
        placeholder="Pilih kategori"
        class="w-full"
      ></Select>

      <Button type="submit"> Request </Button>
    </form>

    <p v-else>
      Mohon maaf anda belum bisa request buku karena requets kamu dibuat dalam 30 hari terakhir
    </p>
  </section>

  <Toast />
</template>
