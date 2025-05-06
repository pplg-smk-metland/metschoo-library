// @vitest-environment nuxt

import type { ActualBuku, Peminjaman, PeminjamanDetail, PeminjamanState } from "~/types"
import { usePeminjamanState } from "./index"
import { describe, it, expect } from "vitest"
import { randomUUID } from "node:crypto"
import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import type { PostgrestError } from "@supabase/supabase-js"

const buku: ActualBuku = {
  id: randomUUID(),
  slug: "dummy-buku",
  no_isbn: "123-456-79",
  jumlah_exspl: 10,
  alamat_terbit: "Jakarta",
  asal: "jonggol",
  image: "dummy/path/to/buku.png",
  judul: "dummy buku",
  jumlah_dipinjam: 1,
  jumlah_exspl_aktual: 0,
  kategori_id: 1,
  penerbit: "Erlangga",
  penulis: "Efraim",
  tahun_terbit: new Date("01-02-1970").toISOString(),
}

const peminjaman: Peminjaman = {
  id: randomUUID(),
  buku_id: buku.id,
  tenggat_waktu: new Date("09-01-2010").toISOString(),
  tgl_pinjam: new Date("10-01-2010").toISOString(),
  user_id: randomUUID(),
}

const peminjamanDetail: PeminjamanDetail = {
  id: 1,
  peminjaman_id: peminjaman.id,
  state_id: 2, // borrow confirmed
  created_at: new Date().toISOString(),
}

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: {
      peminjaman_id: peminjaman.id,
      peminjaman: {
        buku_id: buku.id,
      },
      state_id: peminjamanDetail.state_id,
    },
    error: null,
  }),
}

mockNuxtImport("useSupabaseClient", () => {
  return () => mockSupabaseClient
})

describe("peminjaman state composable", () => {
  const expectedPeminjamanState: PeminjamanState = {
    id: peminjaman.id,
    isBorrowable: false,
    isCancellable: false,
    isReturnable: true,
  }

  it("book with confirmed peminjaman cannot be borrowed again, is cancellable, and is returnable", async () => {
    const peminjamanState = usePeminjamanState(buku, peminjamanDetail)

    await expect(peminjamanState).resolves.toMatchObject(expectedPeminjamanState)
  })

  it("fetches peminjaman detail when details are not provided", async () => {
    const peminjamanState = usePeminjamanState(buku)
    await expect(peminjamanState).resolves.toMatchObject(expectedPeminjamanState)
  })

  it("cannot cancel or return when it returns an PGRST116", async () => {
    mockSupabaseClient.single = vi.fn().mockResolvedValue({
      data: null,
      error: {
        name: "",
        message: "JSON object requested, multiple (or no) rows returned",
        details: "",
        hint: "",
        code: "PGRST116",
      } satisfies PostgrestError,
    })

    const expectedPeminjamanState: PeminjamanState = {
      isBorrowable: false,
      isReturnable: false,
      isCancellable: false,
    }

    const peminjamanState = usePeminjamanState(buku)
    await expect(peminjamanState).resolves.toMatchObject(expectedPeminjamanState)
  })

  it("cannot borrow, cancel, or return when it returns an error", async () => {
    mockSupabaseClient.single = vi.fn().mockResolvedValue({
      data: null,
      error: {
        name: "",
        message: "The Content-Type sent in the request is invalid.",
        details: "",
        hint: "",
        code: "PGRST107",
      } satisfies PostgrestError,
    })

    const expectedPeminjamanState: PeminjamanState = {
      isBorrowable: false,
      isReturnable: false,
      isCancellable: false,
    }

    const peminjamanState = usePeminjamanState(buku)
    await expect(peminjamanState).resolves.toMatchObject(expectedPeminjamanState)
  })
})
