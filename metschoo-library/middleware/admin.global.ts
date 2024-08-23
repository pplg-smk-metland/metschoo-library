export default defineNuxtRouteMiddleware((to) => {
  const adminRegex = new RegExp("/admin(/.*)?")
  const user = useSupabaseUser()

  const isNotAdmin = user.value.app_metadata.role !== "super-admin"

  if (to.path.match(adminRegex) && isNotAdmin) {
    return abortNavigation()
  }
})
