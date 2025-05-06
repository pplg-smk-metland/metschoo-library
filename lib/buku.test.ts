import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import { uploadBookImage } from "./buku"

const mockSupabaseClient = {
  storage: {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn().mockResolvedValue({
      error: null,
    }),
  },
}

mockNuxtImport("useSupabaseClient", () => {
  return () => mockSupabaseClient
})

describe("uploadBukuImage", () => {
  it("returns the error when there is one", async () => {
    const mockFile = new File([new Blob(["a".repeat(10)])], "mock-buku-cover-image.jpg")
    const uploadError = await uploadBookImage("123-456-789", mockFile)

    expect(uploadError).toBeNull()

    mockSupabaseClient.storage.upload = vi.fn().mockResolvedValue({
      error: {
        code: "NoSuchBucket",
        message: "The specified bucket does not exist.",
      },
    })

    const newUploadError = await uploadBookImage("456-789-123", mockFile)
    expect(newUploadError).not.toBeNull()
  })
})
