import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (_to.hash) {
      return { el: _to.hash }
    }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `Thomas Groch - ${to.meta.title}` : 'Thomas Groch'
})

export default router
