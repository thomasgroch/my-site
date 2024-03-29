import { createApp } from 'vue'
import { createMetaManager, plugin as metaPlugin } from 'vue-meta/dist/vue-meta.esm-browser'
import './tailwind.css'
import App from './App.vue'
import router from './router.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'
import i18n from "./i18n";


import 'flowbite';
// import { ValidationProvider } from 'vee-validate';
library.add(faWindowClose)
library.add(fas)
library.add(far)
library.add(fab)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
// app.component('ValidationProvider', ValidationProvider);

  
app.config.productionTip = false
app.use(router)
    .use(i18n)
    .use(createMetaManager()).use(metaPlugin)
    .mount('#app')
