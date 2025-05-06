import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import { addToWishlist, deleteFromWishlist, getWishlist } from "./wishlist"
import { randomInt } from "node:crypto"

import type { PostgrestError } from "@supabase/supabase-js"
import type { ActualBuku } from "~/types"

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  insert: vi.fn(),
  single: vi.fn(),
}

mockNuxtImport("useSupabaseClient", () => {
  return () => mockSupabaseClient
})

describe("wishlist", () => {
  it("returns a wishlist", async () => {
    const data: Array<ActualBuku> = [
      {
        alamat_terbit: "",
        asal: "",
        id: "",
        image: null,
        judul: "",
        jumlah_dipinjam: 0,
        jumlah_exspl: 0,
        jumlah_exspl_aktual: 0,
        kategori_id: 0,
        no_isbn: "",
        penerbit: "",
        penulis: "",
        slug: "",
        tahun_terbit: "",
      },
    ]

    mockSupabaseClient.select = vi.fn().mockResolvedValue({
      data,
      error: null,
    })

    const wishlist = await getWishlist()

    expect(wishlist).toBeInstanceOf(Array)
    expect(wishlist).toEqual(data)
  })

  it("returns an empty array when there is an error", async () => {
    mockSupabaseClient.select = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "",
        name: "",
        code: "PGRST116",
        hint: "",
        details: "",
      } satisfies PostgrestError,
    })

    const wishlist = await getWishlist()
    expect(wishlist).toBeInstanceOf(Array)
    expect(wishlist).toEqual([])
  })

  it("can add a new buku to wishlist", () => {
    mockSupabaseClient.insert = vi.fn().mockResolvedValue({
      error: {
        hint: "",
        code: "",
        name: "",
        details: "",
        message: "",
      } satisfies PostgrestError,
    })

    expect(addToWishlist("123-456-789")).rejects.toThrow()
  })

  it("can delete buku from wishlist", async () => {
    const targetId = randomInt(1, 10)
    mockSupabaseClient.select = vi.fn().mockReturnThis()
    mockSupabaseClient.single = vi.fn().mockResolvedValue({ data: { id: targetId }, error: null })

    const { id: deletedId, error } = await deleteFromWishlist(targetId)
    expect(deletedId).toEqual(targetId)
    expect(error).toEqual(null)
  })

  it("returns error correctly", async () => {
    mockSupabaseClient.single = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "",
        name: "",
        hint: "",
        code: "",
        details: "",
      } satisfies PostgrestError,
    })

    const { error } = await deleteFromWishlist(1)
    expect(error).not.toEqual(null)
  })
})
