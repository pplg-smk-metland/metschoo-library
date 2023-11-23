<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../supabase"
import { ambilGambarBukuDariISBN } from "../../lib/utils"
import CTA from "../CTA.vue"

const props = defineProps({
  buku: Object,
})

const emit = defineEmits(["delete"])

// object buku hasil join ada di dalam object
const dataBuku = props.buku.buku

const imgURL = ref("")

onMounted(async () => {
  imgURL.value = await ambilGambarBukuDariISBN(dataBuku.no_isbn)
})

async function kembalikanBuku() {
  emit("delete")
  try {
    const { error } = await supabase.from("peminjaman").delete().eq("no_isbn", dataBuku.no_isbn)
    if (error) throw error
  } catch (err) {
    console.error(err.message)
  }
}
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
      <p class="buku__status-peminjaman" v-if="!buku.sudah_dipinjam">
        menunggu konfirmasi peminjaman buku
      </p>
      <CTA @click="kembalikanBuku">Kembalikan buku</CTA>
    </figcaption>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
}

.tanggal {
  display: flex;
  justify-content: space-between;
}

.buku__status-peminjaman {
  font-style: italic;
}
</style>
