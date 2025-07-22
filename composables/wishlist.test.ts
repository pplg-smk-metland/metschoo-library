import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import type { PostgrestError } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

const wishlistable = {
  id: randomUUID(),
}

const unwishlistable = {
  id: randomUUID(),
}

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn((column: "buku_id", bookId: string) => ({
    count: bookId === wishlistable.id ? 1 : 0,
  })),
}

mockNuxtImport("useSupabaseClient", () => {
  return () => mockSupabaseClient
})

describe("useCheckWishlist composable", () => {
  it("returns wishlist state correctly", async () => {
    const wishableState = await useCheckWishlist(wishlistable.id)
    expect(wishableState).toBe(true)

    const unwishableState = await useCheckWishlist(unwishlistable.id)
    expect(unwishableState).toBe(false)
  })

  it("cannot add to wishlist when it encounters an error", async () => {
    mockSupabaseClient.eq = vi.fn().mockResolvedValue({
      count: null,
      error: {
        name: "",
        message: "",
        details: "",
        hint: "",
        code: "PGRST116",
      } satisfies PostgrestError,
    })

    expect(await useCheckWishlist(wishlistable.id)).toBe(false)
  })
})
