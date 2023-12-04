<script setup>
import { ref, onMounted } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils"
import CTA from "@/components/CTA.vue"

const props = defineProps({
  buku: Object,
})

const emit = defineEmits(["kembalikanBuku"])

// object buku hasil join ada di dalam object
const dataBuku = props.buku.buku

const imgURL = ref("")

onMounted(async () => {
  imgURL.value = await ambilGambarBukuDariISBN(dataBuku.no_isbn)
})
</script>

<template>
  <li class="buku">
    <figure>
      <img
        :src="imgURL"
        class="buku__gambar"
        alt="gambar buku"
        loading="lazy"
        width="200"
        height="300"
      />
    </figure>
    <figcaption class="buku__info">
      <div class="buku__metadata">
        <h3 class="buku__judul">{{ dataBuku.judul }}</h3>
        <p>{{ dataBuku.no_isbn }}</p>
        <p class="buku__penulis">{{ dataBuku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ dataBuku.tahun_terbit }}</p>
      </div>

      <div class="tanggal">
        <p>
          Tanggal pinjam:
          {{ new Date(buku.tgl_pinjam).toLocaleDateString() }}
        </p>
        <p>
          Tanggal kembali:
          {{ new Date(buku.tgl_kembali).toLocaleDateString() }}
        </p>
      </div>
      <p class="buku__status-peminjaman" v-if="!buku.sudah_dikonfirmasi">
        menunggu konfirmasi peminjaman buku
      </p>
      <CTA @click="$emit('kembalikanBuku')">Kembalikan buku</CTA>
    </figcaption>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
  outline: 2px solid #ddd;
}

.buku__info {
  padding: 1rem;
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
}

.tanggal {
  display: flex;
  justify-content: space-between;
}

.buku__status-peminjaman {
  font-style: italic;
}
</style>
