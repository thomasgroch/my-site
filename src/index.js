import { createApp } from 'vue'
import { createMetaManager } from 'vue-meta'
import './tailwind.css'
import App from './App.vue'
import router from './router.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'
import i18n from "./i18n.js"
import 'flowbite'

library.add(faWindowClose, fas, far, fab)

const app = createApp(App)
const metaManager = createMetaManager()

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
   .use(i18n)
   .use(metaManager)

// Remove config.productionTip as it's no longer needed in Vue 3
app.mount('#app')
