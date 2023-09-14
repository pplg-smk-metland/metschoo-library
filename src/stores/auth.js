import { defineStore } from "pinia"
import { supabase } from "../supabase/index.js"
import router from "../router/index.js"

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
        alert(err.mesage)
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
        alert(err.message)
      }
    },

    async handleSignOut() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        router.push({ name: "home" })
      } catch (err) {
        alert(err.message)
      }
    },
  },
})
