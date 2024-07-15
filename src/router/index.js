import { createRouter, createWebHashHistory } from "vue-router"

const gdMap = () => import("@/views/gdMap/index.vue")
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/gdMap",
      component: gdMap,
    },
    {
      path: "/gdMap",
      component: gdMap,
    },

    {
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
  ],
})

export default router
