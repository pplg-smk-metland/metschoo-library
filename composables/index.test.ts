import type { ActualBuku, Peminjaman, PeminjamanDetail, PeminjamanState } from "~/types"
import { usePeminjamanState } from "./index"
import { describe, it, expect } from "vitest"
import { randomUUID } from "node:crypto"

describe("peminjaman state composable", () => {
  const buku: ActualBuku = {
    no_isbn: "123-456-79",
    jumlah_exspl: 0,
    alamat_terbit: new Date("01-01-1970").toISOString(),
    asal: "jonggol",
    image: "dummy/path/to/buku.png",
    judul: "dummy buku",
    jumlah_dipinjam: 1,
    jumlah_exspl_aktual: 10,
    kategori_id: 1,
    penerbit: "Erlangga",
    penulis: "Efraim",
    tahun_terbit: new Date("01-02-1970").toISOString(),
  }

  it("book with confirmed peminjaman cannot be borrowed again, is cancellable, and is returnable", () => {
    const peminjaman: Peminjaman = {
      id: randomUUID(),
      no_isbn: buku.no_isbn as string,
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

    const peminjamanState = usePeminjamanState(buku, peminjamanDetail)

    const expectedPeminjamanState: PeminjamanState = {
      id: peminjaman.id,
      isBorrowable: false,
      isCancellable: false,
      isReturnable: true,
    }

    expect(peminjamanState).resolves.toMatchObject(expectedPeminjamanState)
  })
})
