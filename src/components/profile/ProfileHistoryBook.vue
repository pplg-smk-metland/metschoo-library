<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { getBukuImage, formatDate } from "@/lib/utils"
import type { History } from "@/views/profile/ProfileRoot.vue"

interface Props {
  data: History[number]
}

const props = defineProps<Props>()
const { buku, tgl_pinjam, tgl_kembali, tenggat_waktu } = props.data
const imgUrl = ref("")

const late = computed(() => {
  return new Date(tenggat_waktu!) < new Date(tgl_kembali!)
})

onMounted(async () => {
  imgUrl.value = await getBukuImage(buku!.no_isbn)
})
</script>

<template>
  <RouterLink v-if="buku" :to="`/buku/${buku.no_isbn}`" class="buku">
    <div class="buku__gambar">
      <img :src="imgUrl" :alt="`Cover ${buku.judul}`" width="100" />
    </div>
    <div class="buku__teks">
      <h3>{{ buku.judul }}</h3>
      <p>{{ buku.penulis }}</p>
      <p class="tanggal-pinjam">dipinjam pada {{ formatDate(new Date(tgl_pinjam)) }}</p>
      <p class="tanggal-pinjam">dikembalikan pada {{ formatDate(new Date(tgl_kembali)) }}</p>
      <p v-if="late" class="late">Terlambat</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.buku {
  overflow: hidden;
  display: flex;
}

.late {
  color: var(--color-warning);
}

.buku:hover {
  background: var(--pale-white);
}

.buku__gambar {
  min-width: max-content;
}

.buku__gambar img {
  border-radius: 0.5rem;
  height: 100%;
  object-fit: cover;
}

.buku__teks {
  padding: 1rem;
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.buku__teks p {
  margin-block: 0;
}

.buku__teks h3 {
  margin-block: 0 0.5rem;
  line-height: 1;
}

.tanggal-pinjam {
  margin-block: 0.2rem 0;
  line-height: 1.1;
}
</style>
