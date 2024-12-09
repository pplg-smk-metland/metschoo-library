<script setup lang="ts">
import IconArrowLeft from "~icons/mdi/arrow-left"

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient()

const { data: peminjamans, error } = await useAsyncData(async () => {
  const { data, error } = await supabase
    .from("peminjaman")
    .select("*, buku(no_isbn, judul, penulis, image), peminjaman_detail(*, peminjaman_state(name))")
    .order("tgl_pinjam", { ascending: false })
    .order("created_at", { referencedTable: "peminjaman_detail", ascending: false })
  if (error) {
    console.error(error)
    return []
  }

  return data
})

onMounted(() => {
  if (error) console.error(error)
})
</script>

<template>
  <div class="max-w-4xl mx-auto grid gap-4">
    <PageHeader heading="Peminjaman">
      <CTA as="router-link" link to="/profil" label="Kembali" class="order-first px-0">
        <IconArrowLeft />
      </CTA>
    </PageHeader>

    <section class="main-section">
      <ul>
        <li
          v-for="peminjaman in peminjamans"
          class="grid gap-4 items-start grid-flow-dense rounded-lg peminjaman-item"
        >
          <template v-if="peminjaman.buku">
            <RouterLink :to="`/buku/${peminjaman.buku.no_isbn}`" class="row-span-2">
              <Image
                :src="getBukuImage(peminjaman.buku?.image)"
                width="400"
                height="600"
                class="size-full object-cover aspect-[2/3] rounded-md"
              />
            </RouterLink>

            <article class="col-span-2">
              <p class="font-bold text-lg">{{ peminjaman.buku.judul }}</p>
              <p>{{ peminjaman.buku.penulis }}</p>
            </article>
          </template>

          <ul class="col-span-2">
            <li v-for="detail in peminjaman.peminjaman_detail" class="detail-item">
              <span class="block text-gray-600 dark:text-gray-400 text-sm order-[-1]">
                {{
                  formatDate(new Date(detail.created_at), {
                    dateStyle: "long",
                    timeStyle: "medium",
                  })
                }}
              </span>

              <span class="order-last pb-2">
                {{ detail.peminjaman_state!.name }}
              </span>
            </li>
          </ul>
        </li>

        <li v-if="!peminjamans">belum ada peminjaman.</li>
      </ul>
    </section>
  </div>
</template>

<style>
.peminjaman-item {
  grid-template-columns: 20ch repeat(2, 1fr);
  grid-template-rows: min-content 1fr;
}

.peminjaman-item + .peminjaman-item {
  @apply pt-4;
}

.detail-item {
  display: grid;
  grid-template-columns: 1rem 1fr;
  column-gap: 1rem;
}

.detail-item::before,
.detail-item::after {
  content: "";

  display: block;
  position: relative;
  justify-self: center;
}

.detail-item::before {
  @apply bg-surface-400/50 dark:bg-blue-100/50;

  border-radius: 100px;
  aspect-ratio: 1/1;
  order: -2;
  padding: 0.5rem;
  height: 100%;
}

.detail-item::after {
  @apply bg-surface-300 dark:bg-surface-600;

  order: -1;
  width: 0.2rem;
  height: 100%;
}

.detail-item:last-of-type::after {
  background: transparent;
}
</style>
