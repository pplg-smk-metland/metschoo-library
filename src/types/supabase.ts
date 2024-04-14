export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admin: {
        Row: {
          email: string
          password: string
        }
        Insert: {
          email: string
          password: string
        }
        Update: {
          email?: string
          password?: string
        }
        Relationships: []
      }
      buku: {
        Row: {
          alamat_terbit: string | null
          asal: string | null
          fts: unknown | null
          judul: string | null
          jumlah_exspl: number | null
          kategori_id: number
          no_isbn: string
          penerbit: string | null
          penulis: string | null
          tahun_terbit: string | null
        }
        Insert: {
          alamat_terbit?: string | null
          asal?: string | null
          fts?: unknown | null
          judul?: string | null
          jumlah_exspl?: number | null
          kategori_id: number
          no_isbn: string
          penerbit?: string | null
          penulis?: string | null
          tahun_terbit?: string | null
        }
        Update: {
          alamat_terbit?: string | null
          asal?: string | null
          fts?: unknown | null
          judul?: string | null
          jumlah_exspl?: number | null
          kategori_id?: number
          no_isbn?: string
          penerbit?: string | null
          penulis?: string | null
          tahun_terbit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_buku_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori_buku"
            referencedColumns: ["id"]
          },
        ]
      }
      kategori_buku: {
        Row: {
          id: number
          kategori: string | null
        }
        Insert: {
          id?: number
          kategori?: string | null
        }
        Update: {
          id?: number
          kategori?: string | null
        }
        Relationships: []
      }
      peminjaman: {
        Row: {
          no_isbn: string
          sudah_dikembalikan: boolean
          sudah_dikonfirmasi: boolean
          tgl_kembali: string | null
          tgl_pinjam: string
          user_id: string
        }
        Insert: {
          no_isbn: string
          sudah_dikembalikan?: boolean
          sudah_dikonfirmasi?: boolean
          tgl_kembali?: string | null
          tgl_pinjam?: string
          user_id: string
        }
        Update: {
          no_isbn?: string
          sudah_dikembalikan?: boolean
          sudah_dikonfirmasi?: boolean
          tgl_kembali?: string | null
          tgl_pinjam?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peminjaman_no_isbn_fkey"
            columns: ["no_isbn"]
            isOneToOne: false
            referencedRelation: "buku"
            referencedColumns: ["no_isbn"]
          },
          {
            foreignKeyName: "peminjaman_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pengguna: {
        Row: {
          email: string | null
          jurusan: string | null
          kelas: string | null
          nama: string | null
          user_id: string
        }
        Insert: {
          email?: string | null
          jurusan?: string | null
          kelas?: string | null
          nama?: string | null
          user_id: string
        }
        Update: {
          email?: string | null
          jurusan?: string | null
          kelas?: string | null
          nama?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengguna_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          no_isbn: string
          user_id: string
          wishlist_id: string
        }
        Insert: {
          no_isbn: string
          user_id?: string
          wishlist_id?: string
        }
        Update: {
          no_isbn?: string
          user_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_no_isbn_fkey"
            columns: ["no_isbn"]
            isOneToOne: true
            referencedRelation: "buku"
            referencedColumns: ["no_isbn"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
