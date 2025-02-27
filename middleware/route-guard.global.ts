export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // prohibit new users from doing anything before editing their profile
  const newUser = user.value?.user_metadata.new
  if (!to.path.match("/profil/edit") && newUser) {
    return navigateTo("/profil/edit/")
  }

  // admin route guard
  const adminRegex = new RegExp("/admin(/.*)?")

  const isNotAdmin = !user.value || user.value.app_metadata?.role !== "super-admin"

  if (to.path.match(adminRegex) && isNotAdmin) {
    return abortNavigation()
  }
})
