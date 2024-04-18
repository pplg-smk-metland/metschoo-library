<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils"
import CTA from "@/components/CTA.vue"
import type { BukuPinjam } from "@/views/profile/ProfileRoot.vue"

interface Props {
  data: BukuPinjam[0]
}

const props = defineProps<Props>()
const emit = defineEmits(["kembalikanBuku"])

// object buku hasil join ada di dalam object
const { data } = props
const { buku } = data

const imgURL = ref("")

onMounted(async () => {
  imgURL.value = await ambilGambarBukuDariISBN(buku!.no_isbn)
})
</script>

<template>
  <li class="buku" v-if="buku">
    <figure>
      <routerLink :to="`/buku/${buku.no_isbn}`">
        <img
          :src="imgURL"
          class="buku__gambar"
          alt="gambar buku"
          loading="lazy"
          width="200"
          height="300"
        />
      </routerLink>
    </figure>
    <figcaption class="buku__info">
      <div class="buku__metadata">
        <h3 class="buku__judul">{{ buku.judul }}</h3>
        <p>{{ buku.no_isbn }}</p>
        <p class="buku__penulis">{{ buku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
      </div>

      <div class="tanggal">
        <p>
          Tanggal pinjam:
          {{ new Date(data.tgl_pinjam).toLocaleDateString() }}
        </p>
        <p>
          Tanggal kembali:
          {{ data.tgl_kembali ? new Date(data.tgl_kembali).toLocaleDateString() : "-" }}
        </p>
      </div>
      <p class="buku__status-peminjaman" v-if="!data.sudah_dikonfirmasi">
        menunggu konfirmasi peminjaman buku
      </p>
      <CTA @click="$emit('kembalikanBuku')">Kembalikan buku</CTA>
    </figcaption>
  </li>
</template>

<style scoped>
.buku {
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.buku:hover {
  background: var(--dark-grey);
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
