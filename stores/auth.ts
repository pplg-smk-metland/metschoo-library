import { defineStore } from "pinia"
import { ref } from "vue"
import { AuthError, type PostgrestError } from "@supabase/supabase-js"
import type { Pengguna } from "@/types"
import type { Database } from "~/types/database.types"

export const useAuthStore = defineStore("auth", () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const profile = ref<Pengguna | null>(null)

  async function init() {
    supabase.auth.onAuthStateChange(async () => {
      if (user.value) profile.value = await getProfile(user.value.id)
    })
  }

  async function handleSignUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
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
      profile.value = null
    } catch (err) {
      if (err instanceof AuthError) console.table(err)
    }
  }

  async function getProfile(id: string): Promise<Pengguna | null> {
    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("user_id, nama, email, kelas, jurusan, role_id")
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
