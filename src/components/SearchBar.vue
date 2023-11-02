<script setup>
import { inject } from "vue"
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
  <form @submit.prevent="cariBuku">
    <input type="search" name="search" id="search" v-model="bukuYangDicari" required />
    <button type="submit">Search</button>
  </form>
</template>
