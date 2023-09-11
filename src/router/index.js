import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  ],
})

export default router
