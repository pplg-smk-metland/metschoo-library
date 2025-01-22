<script setup lang="ts">
import { Toast } from "primevue"
import type { Database } from "~/types/database.types"

definePageMeta({
  title: "Request buku",
  middleware: "auth",
})

const toast = useToast()

const { data } = await useAsyncData(() => getAllAvailableCategories())

const user = useSupabaseUser()

const { data: latestRequest } = await useAsyncData(async () => {
  const supabase = useSupabaseClient<Database>()

  const { data, error } = await supabase
    .from("book_requests")
    .select("*")
    .eq("user_id", user.value!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) console.log(error)
  return data
})

const canRequest = computed(() => {
  if (latestRequest.value === null) return true

  const SecondDate = new Date().getTime() - new Date(latestRequest.value.created_at).getTime()
  const aDayInMs = 24 * 60 * 60 * 1000

  const canRequest = Math.floor(SecondDate / aDayInMs) > 30
  return canRequest
})

const requestData = ref({
  title: "",
  isbn: "",
  category: "",
})

async function insertRequest() {
  const supabase = useSupabaseClient<Database>()

  try {
    const { error } = await supabase.from("book_requests").insert({
      title: requestData.value.title,
      isbn: requestData.value.isbn,
      category: requestData.value.category,
    })

    if (error) throw error

    toast.add({
      severity: "success",
      summary: "menanbahkan request",
      detail: "sukses menanbahkan request buku, mohon ditunggu ya",
      life: 10000,
    })
  } catch (error) {
    console.log(error)

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
      @submit.prevent="insertRequest"
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
