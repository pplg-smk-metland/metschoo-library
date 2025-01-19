import { describe, it, expect } from "vitest"
import { formatDate, getPeminjamanStateDate } from "./index"
import { randomUUID } from "node:crypto"
import type { PeminjamanData } from "~/pages/admin/index.vue"

describe("date util", () => {
  it("formats dates in Indonesian locale correctly", () => {
    expect(formatDate(new Date("July 1, 1970"))).toBe("1 Juli 1970")
  })

  it("can use Intl opts", () => {
    expect(
      formatDate(new Date("February 2, 2002 10:00:05"), { dateStyle: "long", timeStyle: "long" })
    ).toBe("2 Februari 2002 pukul 10.00.05 WIB")
  })
})

describe("peminjaman state date", () => {
  const peminjamanUUID = randomUUID()
  const tgl_pinjam = new Date("July 1, 1970, 10:00:00")
  const returnDate = new Date(tgl_pinjam.getTime() + 20 * 60 * 1000).toISOString()

  const peminjaman: PeminjamanData = [
    {
      no_isbn: "123-456-789",
      tenggat_waktu: new Date("01-10-1970").toISOString(),
      tgl_pinjam: tgl_pinjam.toISOString(),
      user_id: randomUUID(),
      pengguna: null,
      buku: null,
      id: peminjamanUUID,
      peminjaman_detail: [
        {
          id: 1,
          state_id: 1,
          // 5 mins later
          created_at: new Date(tgl_pinjam.getTime() + 5 * 60 * 1000).toISOString(),
          peminjaman_id: peminjamanUUID,
          peminjaman_state: {
            name: "borrow pending",
          },
        },
        {
          id: 2,
          state_id: 2,
          // 10 mins later
          created_at: new Date(tgl_pinjam.getTime() + 10 * 60 * 1000).toISOString(),
          peminjaman_id: peminjamanUUID,
          peminjaman_state: {
            name: "borrow confirmed",
          },
        },
        {
          id: 3,
          state_id: 3,
          // 15 mins later
          created_at: new Date(tgl_pinjam.getTime() + 15 * 60 * 1000).toISOString(),
          peminjaman_id: peminjamanUUID,
          peminjaman_state: {
            name: "return pending",
          },
        },
        {
          id: 4,
          state_id: 4,
          // 20 mins later
          created_at: returnDate,
          peminjaman_id: peminjamanUUID,
          peminjaman_state: {
            name: "return confirmed",
          },
        },
      ],
    },
  ]

  it("returns the correct formatted state date", () => {
    const peminjamanStateDate = getPeminjamanStateDate(peminjaman[0], 4)
    expect(peminjamanStateDate).toBe(formatDate(new Date(returnDate)))
  })
})
