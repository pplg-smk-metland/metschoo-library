import type { Tables } from "./supabase"

// thttps://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescriptype Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// fts for some reason is not optional :(
export type Buku = PartialBy<Tables<"buku">, "fts">
export type Pengguna = Tables<"pengguna">
export type Kategori = Tables<"kategori_buku">
