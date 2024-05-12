<script setup lang="ts">
import { inject, ref } from "vue"
import { searchTermKey } from "@/stores/search"
import router from "@/router"

import CTA from "@/components/CTA.vue"

const emit = defineEmits(["search"])
const bukuYangDicari = inject(searchTermKey, ref(""))

async function cariBuku() {
  if (router.currentRoute.value.name !== "pustaka") {
    router.push({ name: "pustaka" })
  } else {
    emit("search")
  }
}
</script>

<template>
  <form
    id="search-form"
    @submit.prevent="cariBuku"
  >
    <input
      id="search-input"
      v-model="bukuYangDicari"
      type="search"
      name="search"
      placeholder="Cari buku disini"
      required
    >
    <CTA id="search-submit">
      Search
    </CTA>
  </form>
</template>

<style scoped>
#search-form {
  display: flex;
  gap: 1rem;
}

#search-input {
  flex-grow: 1;
}

#search-form .btn {
  margin: 0;
}
</style>
