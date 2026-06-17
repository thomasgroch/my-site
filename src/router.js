import { createRouter, createWebHistory } from 'vue-router'

/** @type {import('vue-router').RouterOptions['routes']} */
const routes = [
  { path: '/', component: () => import('./views/Home.vue'), meta: { title: 'Home' } },
  {
    path: '/about',
    meta: { title: 'About' },
    component: () => import('./views/About.vue'),
  },
  {
    path:'/projetos',
    meta: { title: 'Projetos' },
    component: () => import('./views/ProjectPage.vue'),

  },
  {
    path: '/stack',
    component: () => import('./views/StackPage.vue'),
  },
  {
    path: '/contato',
    component: () => import('./views/ContactPage.vue')
  },
  {
    path: '/entrevista',
    component: () => import('./views/MeetPage.vue'),
    meta: { title: 'Meet' },
    alias: ['/meet', '/reuniao', '/interview']
  },
  {
    path: '/entrevista/:nome',
    component: () => import('./views/MeetPage.vue'),
    meta: { title: 'Meet' },
    props: true,
    alias: ['/meet/:nome', '/reuniao/:nome', '/interview/:nome']
  },
  {
    path: '/entrevista/:nome/:date',
    component: () => import('./views/MeetPage.vue'),
    meta: { title: 'Meet' },
    props: true,
    alias: ['/meet/:nome/:date', '/interview/:nome/:date']
  },


  { path: '/:path(.*)', component: () => import('./views/NotFound.vue') },
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
