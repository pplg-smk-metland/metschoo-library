import { defineStore } from "pinia"
import { ref } from "vue"
import { AuthError, type PostgrestError, type Session, type User } from "@supabase/supabase-js"
import type { Pengguna } from "@/types"
import type { Database } from "~/types/supabase"


export const useAuthStore = defineStore("auth", () => {
  const supabase = useSupabaseClient<Database>()

  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)

  async function init() {
    supabase.auth.onAuthStateChange(async (_, _session) => {
      session.value = _session

      if (!session.value) return
      user.value = await getUser(session.value.access_token)
    })
  }

  async function getUser(jwt: string) {
    const { data, error } = await supabase.auth.getUser(jwt)
    if (error) throw error
    return data.user
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
      user.value = null

      if (error) throw error
    } catch (err) {
      if (err instanceof AuthError) console.table(err)
    }
  }

  async function getProfile(session: Session) {
    try {
      const { data, error } = await supabase
        .from("pengguna")
        .select("user_id, nama, email, kelas, jurusan, role_id")
        .eq("user_id", session.user.id)
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
    user,
    init,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    getProfile,
    handleUpdateProfile,
  }
})
