import { useAuthStore } from "@/stores/auth"
import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import NotFound from "@/views/NotFound.vue"

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
  {
    path: "/pustaka",
    name: "pustaka",
    component: () => import("../views/PustakaView.vue"),
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: () => import("../views/WishListView.vue"),
  },
  {
    path: "/sign-in",
    name: "sign-in",
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/SignInView.vue"),
  },
  {
    path: "/profile",
    component: () => import("../views/ProfileView.vue"),
    children: [
      {
        path: "",
        name: "profile",
        component: () => import("../views/profile/ProfileRoot.vue"),
      },
      {
        path: "edit",
        name: "profile-edit",
        component: () => import("../views/profile/ProfileEdit.vue"),
      },
      {
        path: "credentials",
        name: "profile-credentials",
        component: () => import("../views/profile/ProfileCredentials.vue"),
      },
    ],
  },

  {
    path: "/buku/:isbn",
    component: () => import("../views/BookView.vue"),
  },
  {
    path: "/admin",
    component: () => import("../views/AdminView.vue"),
    children: [
      {
        path: "",
        name: "admin",
        component: () => import("../views/admin/AdminRoot.vue"),
      },
      {
        path: "manajemen-pengguna",
        name: "manajemen-pengguna",
        component: () => import("../views/admin/AdminManajemenPengguna.vue"),
      },
      {
        path: "peminjaman",
        name: "peminjaman",
        component: () => import("../views/admin/AdminPeminjaman.vue"),
      },
      {
        path: "data-buku",
        name: "data-buku",
        component: () => import("../views/admin/AdminDataBuku.vue"),
      },
      {
        path: "daftar-buku",
        name: "daftar-buku",
        component: () => import("../views/admin/AdminDaftarBuku.vue"),
      },
      {
        path: "tambah-buku",
        name: "tambah-buku",
        component: () => import("../views/admin/AdminTambahBuku.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: "active",
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const user = authStore.session?.user
  if (user) {
    if (user.role !== "admin" && to.name === "admin") {
      return { name: "home" }
    }
  }
})

export default router
