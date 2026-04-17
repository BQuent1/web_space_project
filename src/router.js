import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './components/ui/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('./views/AppScene.vue')
    }
  ]
})

export default router
