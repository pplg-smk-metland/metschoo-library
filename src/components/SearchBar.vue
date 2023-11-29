<script setup>
import { inject } from "vue"
import router from "@/router"
import CTA from "@/components/CTA.vue"

const emit = defineEmits(["search"])
const bukuYangDicari = inject("searchTerm")

async function cariBuku() {
  if (router.currentRoute.value.name !== "pustaka") {
    router.push({ name: "pustaka" })
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
#search {
  margin: 20px 0px;
}
</style>
