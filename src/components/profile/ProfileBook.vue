<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getBukuImage } from "@/lib/utils"
import type { BukuPinjam } from "@/views/profile/ProfileRoot.vue"

interface Props {
  data: BukuPinjam[0]
}

const { data } = defineProps<Props>()
const { buku } = data

const imgURL = ref("")

onMounted(async () => {
  imgURL.value = await getBukuImage(buku!.no_isbn)
})
</script>

<template>
  <li>
    <routerLink v-if="buku" :to="`/buku/${buku.no_isbn}`" class="buku">
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
          <h3 class="buku__judul">
            {{ buku.judul }}
          </h3>
          <p>{{ buku.no_isbn }}</p>
          <p class="buku__penulis">
            {{ buku.penulis }} -<span class="buku__tahun-terbit">{{ buku.tahun_terbit }}</span>
          </p>
        </div>
      </figcaption>

      <div class="tanggal">
        <p>
          Dipinjam pada:
          <time :datetime="new Date(data.tgl_pinjam).toString()">
            {{ new Date(data.tgl_pinjam).toLocaleDateString() }}
          </time>
        </p>
        <p>
          Tenggat pengembalian:
          <time :datetime="new Date(data.tenggat_waktu).toString()">
            {{ new Date(data.tenggat_waktu).toLocaleDateString() }}
          </time>
        </p>
      </div>
    </routerLink>
  </li>
</template>

<style scoped>
.buku {
  outline: 1px solid var(--primary);
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 1rem;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.buku:hover {
  background: var(--dark-grey);
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
}

.buku__metadata p {
  line-height: 1;
}

.buku__judul {
  margin-block: 0 0.2rem;
  line-height: 1;
}

.tanggal {
  margin-block-start: auto;
}

.tanggal > * {
  line-height: 1.2;
  margin-block: 0.5rem;
}

.tanggal time {
  font-weight: bold;
  display: block;
}
</style>
