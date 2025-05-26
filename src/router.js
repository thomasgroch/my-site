import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import ProjectPage from './views/ProjectPage.vue'
import StackPage from './views/StackPage.vue'
import ContactPage from './views/ContactPage.vue'
import MeetPage from './views/MeetPage.vue'

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
    component: ContactPage
  },
  {
    path: '/entrevista',
    component: MeetPage,
    meta: { title: 'Meet' },
    alias: ['/meet', '/reuniao', '/interview']
  },
  {
    path: '/entrevista/:nome',
    component: MeetPage,
    meta: { title: 'Meet' },
    props: true,
    alias: ['/meet/:nome', '/reuniao/:nome', '/interview/:nome']
  },
  {
    path: '/entrevista/:nome/:date',
    component: MeetPage,
    meta: { title: 'Meet' },
    props: true,
    alias: ['/meet/:nome/:date', '/interview/:nome/:date']
  },


  { path: '/:path(.*)', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
    scrollBehavior () {
    // return desired position
    // Parameters were removed since they weren't being used
  }
})

router.afterEach((to) => {
  document.title = document.title + ' - ' + to.meta.title || 'Thomas Groch'
});
export default router
