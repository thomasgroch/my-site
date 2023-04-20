import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import ProjectPage from './views/ProjectPage.vue'
import StackPage from './views/StackPage.vue'

/** @type {import('vue-router').RouterOptions['routes']} */
const routes = [
  { path: '/', component: Home, meta: { title: 'Home' } },
  {
    path: '/about',
    meta: { title: 'About' },
    component: About,
    // example of route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import('./views/About.vue')
  },
  {
    path:'/projetos',
    meta: { title: 'Projetos' },
    component: ProjectPage,

  },
  {
    path: '/stack',
    component: StackPage,
  },
  {
    path: '/contato',
    component: import('./views/ContactPage.vue')
  },
  {
    path: '/entrevista/:nome',
    component: import('./views/MeetPage.vue'),
    props: true,
    alias: ['/meet/:nome', '/conferencia/:nome']
  },
  {
    path: '/entrevista/:nome/:date',
    component: import('./views/MeetPage.vue'),
    props: true,
    alias: ['/meet/:nome/:date', '/conferencia/:nome/:date']
  },


  { path: '/:path(.*)', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
    scrollBehavior (to, from, savedPosition) {
    // return desired position

  }
})

export default router
