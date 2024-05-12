<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import { getAllAvailableCategories } from "@/lib/utils"
import CTA from "@/components/CTA.vue"
import type { Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

const searchTerm = ref("")

const availableCategories = ref<Kategori[]>([])
const selectedCategory = ref<Kategori["id"]>(1)

interface SearchedBuku {
  no_isbn: string
  judul: string
  penulis: string
  kategori_buku: {
    kategori: string
  } | null
}
const daftarBuku = ref<SearchedBuku[] | never>([])

async function ambilBuku() {
  const { data, error } = await supabase
    .from("buku")
    .select(`no_isbn, judul, penulis, kategori_buku(kategori)`)
    .limit(20)
  if (error) throw error
  return data
}

async function searchBooks() {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select(`no_isbn, judul, penulis, kategori_buku(kategori)`)
      .textSearch("judul", searchTerm.value, { type: "websearch" })
      .eq("kategori_id", selectedCategory.value)
      .limit(30)

    if (error) throw error
    daftarBuku.value = data
  } catch (err) {
    console.trace((err as PostgrestError).message)
  }
}

onMounted(async () => {
  daftarBuku.value = await ambilBuku()
  availableCategories.value = await getAllAvailableCategories()
})
</script>

<template>
  <h1>Data buku</h1>

  <form @submit.prevent="searchBooks">
    <input
      id="search-term"
      v-model="searchTerm"
      type="text"
      name="search-term"
      placeholder="search for book"
      required
    >
    <select
      id="search-category"
      v-model="selectedCategory"
      name="search-category"
      required
    >
      <option
        value=""
        disabled
      >
        Select one
      </option>
      <option
        v-for="category in availableCategories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.id }} - {{ category.kategori }}
      </option>
    </select>
    <CTA>Search</CTA>
  </form>

  <ul>
    <li
      v-if="!daftarBuku.length"
      class="not-found"
    >
      Bukunya ga ketemu. Coba lagi, mungkin salah ketik atau salah kategori. Atau bukunya memang ga
      ada.
    </li>
    <li
      v-for="buku in daftarBuku"
      v-else
      :key="buku.no_isbn"
    >
      <routerLink :to="{ name: 'admin-halaman-buku', params: { isbn: buku.no_isbn } }">
        <p>{{ buku.judul }}</p>
        <p>{{ buku.penulis }}</p>
        <p>{{ buku.kategori_buku?.kategori }}</p>
      </routerLink>
    </li>
  </ul>
</template>
