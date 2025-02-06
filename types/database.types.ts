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
      book_requests: {
        Row: {
          category: string
          created_at: string
          id: number
          is_accepted: Database["public"]["Enums"]["request status"] | null
          isbn: string
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: number
          is_accepted?: Database["public"]["Enums"]["request status"] | null
          isbn: string
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          is_accepted?: Database["public"]["Enums"]["request status"] | null
          isbn?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["user_id"]
          },
        ]
      }
      buku: {
        Row: {
          alamat_terbit: string
          asal: string
          fts: unknown | null
          id: string
          image: string | null
          judul: string
          jumlah_exspl: number
          kategori_id: number
          no_isbn: string
          penerbit: string
          penulis: string
          slug: string
          tahun_terbit: string
        }
        Insert: {
          alamat_terbit: string
          asal: string
          fts?: unknown | null
          id?: string
          image?: string | null
          judul: string
          jumlah_exspl?: number
          kategori_id: number
          no_isbn?: string
          penerbit: string
          penulis: string
          slug?: string
          tahun_terbit: string
        }
        Update: {
          alamat_terbit?: string
          asal?: string
          fts?: unknown | null
          id?: string
          image?: string | null
          judul?: string
          jumlah_exspl?: number
          kategori_id?: number
          no_isbn?: string
          penerbit?: string
          penulis?: string
          slug?: string
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
      kunjungan: {
        Row: {
          event: Database["public"]["Enums"]["event type"]
          id: number
          timestamp: string
          user_id: string
        }
        Insert: {
          event?: Database["public"]["Enums"]["event type"]
          id?: number
          timestamp?: string
          user_id?: string
        }
        Update: {
          event?: Database["public"]["Enums"]["event type"]
          id?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kunjungan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["user_id"]
          },
        ]
      }
      peminjaman: {
        Row: {
          buku_id: string
          id: string
          tenggat_waktu: string
          tgl_pinjam: string | null
          user_id: string
        }
        Insert: {
          buku_id: string
          id?: string
          tenggat_waktu: string
          tgl_pinjam?: string | null
          user_id?: string
        }
        Update: {
          buku_id?: string
          id?: string
          tenggat_waktu?: string
          tgl_pinjam?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peminjaman_buku_id_fkey"
            columns: ["buku_id"]
            isOneToOne: false
            referencedRelation: "actual_buku"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peminjaman_buku_id_fkey"
            columns: ["buku_id"]
            isOneToOne: false
            referencedRelation: "buku"
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
      peminjaman_detail: {
        Row: {
          created_at: string
          id: number
          peminjaman_id: string
          state_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          peminjaman_id: string
          state_id: number
        }
        Update: {
          created_at?: string
          id?: number
          peminjaman_id?: string
          state_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "peminjaman_detail_peminjaman_id_fkey"
            columns: ["peminjaman_id"]
            isOneToOne: false
            referencedRelation: "peminjaman"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peminjaman_detail_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "peminjaman_state"
            referencedColumns: ["id"]
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
          phone_no: string | null
          rfid: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          email: string
          jurusan?: string | null
          kelas?: string | null
          nama?: string
          phone_no?: string | null
          rfid?: string | null
          role_id?: number
          user_id?: string
        }
        Update: {
          email?: string
          jurusan?: string | null
          kelas?: string | null
          nama?: string
          phone_no?: string | null
          rfid?: string | null
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
          buku_id: string
          id: number
          user_id: string
        }
        Insert: {
          buku_id: string
          id?: number
          user_id?: string
        }
        Update: {
          buku_id?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_buku_id_fkey"
            columns: ["buku_id"]
            isOneToOne: false
            referencedRelation: "actual_buku"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_buku_id_fkey"
            columns: ["buku_id"]
            isOneToOne: false
            referencedRelation: "buku"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pengguna"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      actual_buku: {
        Row: {
          alamat_terbit: string | null
          asal: string | null
          id: string | null
          image: string | null
          judul: string | null
          jumlah_dipinjam: number | null
          jumlah_exspl: number | null
          jumlah_exspl_aktual: number | null
          kategori_id: number | null
          no_isbn: string | null
          penerbit: string | null
          penulis: string | null
          slug: string | null
          tahun_terbit: string | null
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
    }
    Functions: {
      check_out_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      dashboard_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      "event type": "check_in" | "check_out"
      "request status": "processing" | "accepted" | "rejected"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

