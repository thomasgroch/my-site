import { createApp } from 'vue'
import { createMetaManager } from 'vue-meta'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './tailwind.css'
import 'flowbite'

// Add icons to library
library.add(faWindowClose, fas, far, fab)

const app = createApp(App)
const metaManager = createMetaManager({
  meta: {
    tag: 'meta',
    nameless: true
  }
}, () => ({}))

// Register global components
app.component('font-awesome-icon', FontAwesomeIcon)

// Use plugins
app.use(router)
   .use(i18n)
   .use(metaManager)

// Mount the app
app.mount('#app')
