import { defineStore } from "pinia"
import { supabase } from "@/lib/supabase"
import router from "@/router"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    session: null,
  }),

  actions: {
    async init() {
      supabase.auth.getSession(({ data }) => {
        this.session = data.session
      })

      supabase.auth.onAuthStateChange((_, _session) => {
        this.session = _session
      })
    },

    async handleSignUp(email, password) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert("Cek email lu ya buat verifikasi email!")
      } catch (err) {
        alert(err.message)
      }
    },

    async handleSignIn(email, password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push({ name: "home" })
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async handleSignOut() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        router.push({ name: "home" })
      } catch (err) {
        throw new Error(err.message)
      }
    },

    async getProfile() {
      if (!this.session) return null

      try {
        const { data, error, status } = await supabase
          .from("pengguna")
          .select("nama, email, kelas, jurusan")
          .eq("user_id", this.session.user.id)
          .single()
        if (error && status !== 406) throw error
        return data
      } catch (err) {
        console.trace(err.message)
      }
    },

    async handleUpdateProfile(profileUpdates) {
      const updates = {
        user_id: this.session.user.id,
        ...profileUpdates,
      }
      try {
        const { error } = await supabase.from("pengguna").upsert(updates)
        if (error) throw error
      } catch (err) {
        console.error(err.message)
      }
    },
  },
})
