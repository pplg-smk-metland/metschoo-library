import { defineStore } from "pinia"
import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import { AuthError, type PostgrestError, type Session } from "@supabase/supabase-js"
import type { Pengguna } from "@/types"

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null)

  async function init() {
    const {
      data: { session: _session },
    } = await supabase.auth.getSession()
    session.value = _session

    supabase.auth.onAuthStateChange((_, _session) => {
      session.value = _session
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
      session.value = null

      if (error) throw error
    } catch (err) {
      if (err instanceof AuthError) console.table(err)
    }
  }

  async function getProfile() {
    if (!session.value) return null

    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("user_id, nama, email, kelas, jurusan, role_id")
        .eq("user_id", session.value.user.id)
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.trace((err as PostgrestError).message)
      return null
    }
  }

  async function handleUpdateProfile(profileUpdates: Pengguna) {
    if (session.value === null) throw Error("session does not exist")

    const updates = {
      ...profileUpdates,
    }
    const { error } = await supabase.from("pengguna").upsert(updates)
    if (error) throw error
  }

  return {
    session,
    init,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    getProfile,
    handleUpdateProfile,
  }
})
