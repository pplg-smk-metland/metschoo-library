import { defineStore } from "pinia"
import { supabase } from "@/lib/supabase"
import { type PostgrestError, type Session } from "@supabase/supabase-js"
import router from "@/router"
import { ref } from "vue"

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

  async function handleSignUp(email, password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  async function handleSignIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    router.push({ name: "home" })
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push({ name: "home" })
    if (error) throw error
  }

  async function getProfile() {
    if (!session.value) return null

    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("nama, email, kelas, jurusan")
        .eq("user_id", session.value.user.id)
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.trace((err as PostgrestError).message)
    }
  }

  async function handleUpdateProfile(profileUpdates) {
    if (session.value === null) throw Error("session does not exist")

    const updates = {
      user_id: session.value.user.id,
      ...profileUpdates,
    }
    try {
      const { error } = await supabase.from("pengguna").upsert(updates)
      if (error) throw error
    } catch (err) {
      console.error((err as PostgrestError).message)
    }
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
