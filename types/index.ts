import type { Tables } from "./database.types.ts"

// thttps://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescriptype Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// fts for some reason is not optional :(
export type Buku = PartialBy<Tables<"buku">, "fts">
export type Pengguna = Tables<"pengguna">
export type Kategori = Tables<"kategori_buku">
export type Peminjaman = Tables<"peminjaman">

export interface PeminjamanState {
  id?: Peminjaman["id"]
  isBorrowable: boolean
  isCancellable: boolean
  isReturnable: boolean
}

export type SignUpData = {
  nama: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

export interface PeminjamanSearchArgs {
  peminjam: Pengguna["nama"]
  no_isbn: Buku["no_isbn"]
  tgl_pinjam: Array<Date | null>
  tenggat_waktu: Array<Date | null>
}

export interface BukuSearchArgs {
  judul?: string
  no_isbn?: Buku["no_isbn"]
  kategori?: Kategori["id"] | null
}

export type Theme = "light" | "dark"
