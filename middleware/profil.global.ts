export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const profilRegex = new RegExp("/profil(/.*)?")

  if (to.path.match(profilRegex) && !user.value) {
    return abortNavigation()
  }
})
