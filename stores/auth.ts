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

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        profile.value = null
        return
      }

      // use setTimeout as per the docs
      // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
      setTimeout(async () => {
        if (!user.value) return
        profile.value = await getProfile(user.value.id)
      })

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        setTimeout(async () => {
          if (!user.value || !user.value.user_metadata.new) return
          const { nama, phone_no } = user.value.user_metadata

          const { error } = await supabase
            .from("pengguna")
            .update({ nama, phone_no })
            .eq("user_id", user.value.id)

          if (error) console.error("gagal memperbarui metadata pengguna.")

          const { error: updateNewError } = await supabase.auth.updateUser({
            data: {
              new: false,
            },
          })

          if (updateNewError) {
            console.error(updateNewError)
            console.error("gagal memperbarui metadata pengguna (complete signup flow).")
          }
        }, 0)
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

  async function handleForgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: import.meta.dev
        ? "http://localhost:3000/profil/keamanan/reset-password"
        : "https://metschoo-lib-preview.netlify.app/profil/keamanan/reset-password",
    })
    if (error) throw error
  }

  async function handleResetPassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error

    console.log(error)
  }

  async function getProfile(id: string): Promise<Pengguna | null> {
    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("user_id, nama, email, kelas, jurusan, phone_no, role_id")
        .eq("user_id", id)
        .single()
      if (error) throw error
      return data as Pengguna
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
    handleForgotPassword,
    handleResetPassword,
    getProfile,
    handleUpdateProfile,
  }
})
