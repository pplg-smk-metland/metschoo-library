import { navigateTo } from "nuxt/app"
// import parseCSVWithStream from "@/utils/csv"

export default defineEventHandler(async (event) => {
  // TODO: upload file here
  // parseCSVWithStream(event)
  return navigateTo({ path: "/admin/buku/" })
})
