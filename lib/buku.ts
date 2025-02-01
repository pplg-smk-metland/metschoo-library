import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"

export const schema = z.object({
  judul: z.string().nonempty("judul tidak boleh kosong."),
  no_isbn: z.string().nonempty("isbn tidak boleh kosong."),
  image: z.string().optional().nullable().default(null),
  kategori_id: z.number({ message: "buku harus memiliki kategori." }),
  asal: z.string().default("-"),
  jumlah_exspl: z
    .number({ message: "jumlah harus berupa angka." })
    .min(0, "jumlah harus 0 atau lebih.")
    .max(10000, "banyak amat sih ga mungkin lah bukunya segitu."),
  penerbit: z.string().nonempty("penerbit tidak boleh kosong."),
  alamat_terbit: z.string().nonempty("alamat penerbit tidak boleh kosong."),
  tahun_terbit: z
    .string()
    .regex(/^\d{0,4}$/, { message: "tahun terbit harus berupa angka 0 sampai 4 digit." }),
  penulis: z.string().nonempty("penulis tidak boleh kosong"),
})

export const resolver = zodResolver(schema)
