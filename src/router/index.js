import { useAuthStore } from "../stores/auth"
import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
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
    name: "profile",
    component: () => import("../views/ProfileView.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/SearchView.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/AdminView.vue"),
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
