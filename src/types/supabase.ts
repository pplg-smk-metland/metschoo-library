export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      buku: {
        Row: {
          alamat_terbit: string
          asal: string
          fts: unknown | null
          judul: string
          jumlah_exspl: number
          kategori_id: number
          no_isbn: string
          penerbit: string
          penulis: string
          tahun_terbit: string
        }
        Insert: {
          alamat_terbit: string
          asal: string
          fts?: unknown | null
          judul: string
          jumlah_exspl?: number
          kategori_id: number
          no_isbn: string
          penerbit: string
          penulis: string
          tahun_terbit: string
        }
        Update: {
          alamat_terbit?: string
          asal?: string
          fts?: unknown | null
          judul?: string
          jumlah_exspl?: number
          kategori_id?: number
          no_isbn?: string
          penerbit?: string
          penulis?: string
          tahun_terbit?: string
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
          kategori: string
        }
        Insert: {
          id?: number
          kategori: string
        }
        Update: {
          id?: number
          kategori?: string
        }
        Relationships: []
      }
      peminjaman: {
        Row: {
          id: string
          no_isbn: string
          state_id: number
          tenggat_waktu: string
          tgl_kembali: string | null
          tgl_pinjam: string
          user_id: string
        }
        Insert: {
          id?: string
          no_isbn: string
          state_id?: number
          tenggat_waktu: string
          tgl_kembali?: string | null
          tgl_pinjam?: string
          user_id?: string
        }
        Update: {
          id?: string
          no_isbn?: string
          state_id?: number
          tenggat_waktu?: string
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
            foreignKeyName: "peminjaman_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "peminjaman_state"
            referencedColumns: ["id"]
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
      peminjaman_state: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      pengguna: {
        Row: {
          email: string
          jurusan: string | null
          kelas: string | null
          nama: string
          role_id: number
          user_id: string
        }
        Insert: {
          email: string
          jurusan?: string | null
          kelas?: string | null
          nama: string
          role_id?: number
          user_id: string
        }
        Update: {
          email?: string
          jurusan?: string | null
          kelas?: string | null
          nama?: string
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengguna_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "pengguna_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengguna_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pengguna_roles: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          id: string
          no_isbn: string
          user_id: string
        }
        Insert: {
          id?: string
          no_isbn: string
          user_id?: string
        }
        Update: {
          id?: string
          no_isbn?: string
          user_id?: string
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
      distinct_riwayat: {
        Row: {
          buku: Database["public"]["Tables"]["buku"]["Row"] | null
          state_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "peminjaman_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "peminjaman_state"
            referencedColumns: ["id"]
          },
        ]
      }
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
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
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
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
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
