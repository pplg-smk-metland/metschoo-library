<script setup>
import { inject } from "vue"
import CTA from "./CTA.vue"
import router from "../router"

const emit = defineEmits(["search"])
const bukuYangDicari = inject("searchTerm")

async function cariBuku() {
  if (router.currentRoute.value.name !== "search") {
    router.push({ name: "search" })
  } else {
    emit("search")
  }
}
</script>

<template>
  <form id="search-form" @submit.prevent="cariBuku">
    <input
      type="search"
      name="search"
      id="search"
      placeholder="Cari buku disini"
      v-model="bukuYangDicari"
      required
    />
    <CTA :is-button="true">Search</CTA>
  </form>
</template>

<style scoped>
#search-form {
  display: flex;
  gap: 1rem;
}

#search:hover {
  background: var(--dark-grey);
}
</style>
