import { RouteRecordRaw } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import ProjectPage from './views/ProjectPage.vue'
import StackPage from './views/StackPage.vue'
import ContactPage from './views/ContactPage.vue'
import MeetPage from './views/MeetPage.vue'

export const routes: RouteRecordRaw[] = [
  { 
    path: '/', 
    component: Home, 
    meta: { title: 'Home' } 
  },
  {
    path: '/about',
    meta: { title: 'About' },
    component: About,
  },
  {
    path: '/projetos',
    meta: { title: 'Projetos' },
    component: ProjectPage,
  },
  {
    path: '/stack',
    component: StackPage,
    meta: { title: 'Stack' }
  },
  {
    path: '/contato',
    component: ContactPage,
    meta: { title: 'Contato' }
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
  { 
    path: '/:path(.*)', 
    component: NotFound,
    meta: { title: '404' }
  },
]

