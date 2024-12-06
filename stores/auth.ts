import { defineStore } from "pinia"
import { ref } from "vue"
import { AuthError, type PostgrestError } from "@supabase/supabase-js"
import type { Pengguna, SignUpData } from "@/types"
import type { Database } from "~/types/database.types"

export const useAuthStore = defineStore("auth", () => {
  const supabase = useSupabaseClient<Database>()

  const profile = ref<Pengguna | null>(null)

  async function init() {
    const user = useSupabaseUser()

    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        profile.value = null
        return
      }

      if (user.value) {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          if (user.value.user_metadata.new) {
            const { nama, phone_no } = user.value.user_metadata

            const { error } = await supabase
              .from("pengguna")
              .update({ nama, phone_no })
              .eq("user_id", user.value.id)

            if (error) console.error("gagal memperbarui metadata pengguna.")

            const { error: updateNewError } = await supabase.auth.admin.updateUserById(
              user.value.id,
              {
                user_metadata: {
                  new: false,
                },
              }
            )

            if (updateNewError)
              console.error("gagal memperbarui metadata pengguna (complete signup flow).")
          }
        }

        profile.value = await getProfile(user.value.id)
      }
    })
  }

  async function handleSignUp({
    nama,
    email,
    phoneNumber,
    password,
  }: Required<Pick<SignUpData, "nama" | "phoneNumber" | "email" | "password">>) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama,
          phone_no: phoneNumber,
          new: true,
        },
      },
    })

    return error
  }

  async function handleSignIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return error
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error
    } catch (err) {
      if (err instanceof AuthError) console.table(err)
    }
  }

  async function getProfile(id: string): Promise<Pengguna | null> {
    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("user_id, nama, email, kelas, jurusan, phone_no, role_id")
        .eq("user_id", id)
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.trace((err as PostgrestError).message)
      return null
    }
  }

  async function handleUpdateProfile(profileUpdates: Pengguna) {
    const updates = {
      ...profileUpdates,
    }
    const { error } = await supabase.from("pengguna").upsert(updates)
    if (error) throw error
  }

  return {
    profile,
    init,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    getProfile,
    handleUpdateProfile,
  }
})
