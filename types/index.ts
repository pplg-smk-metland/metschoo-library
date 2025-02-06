import type { Tables } from "./database.types.ts"

// thttps://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescriptype Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// https://stackoverflow.com/questions/53050011/remove-null-or-undefined-from-properties-of-a-type
type NoUndefinedField<T, Except = never> = {
  [P in keyof T]: P extends Except ? T[P] : Required<NonNullable<T[P]>>
}

// fts for some reason is not optional :(
export type Buku = PartialBy<Tables<"buku">, "fts">

// type of actual_buku view, which contains columns for
// calculating how much is borrowed and how much is available
export type ActualBuku = NoUndefinedField<Tables<"actual_buku">, "image">
export type Pengguna = Tables<"pengguna">
export type Kategori = Tables<"kategori_buku">
export type Peminjaman = Tables<"peminjaman">
export type PeminjamanDetail = Tables<"peminjaman_detail">
export type BookRequest = Tables<"book_requests">
export type Wishlist = Tables<"wishlist">

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

export interface KunjunganSearchArgs {
  timestamp_range: Array<Date | null>
}

export type Theme = "light" | "dark"

export interface PhoneValidationResult {
  isValid: boolean
  message: string
}

export interface RequestData {
  title: string
  isbn: string
  category: string
}
