import { createApp } from 'vue'
import { createMetaManager, plugin as metaPlugin } from 'vue-meta/dist/vue-meta.esm-browser'
import './tailwind.css'
import App from './App.vue'
import router from './router.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faAngleDown,
  faAngleUp
} from '@fortawesome/free-solid-svg-icons'
import {
  faGithub,
  faGitlab,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons'
import i18n from "./i18n";

// import { ValidationProvider } from 'vee-validate';
library.add(
  faAngleDown,
  faAngleUp,
  faGithub,
  faGitlab,
  faLinkedin
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
// app.component('ValidationProvider', ValidationProvider);

  
app.config.productionTip = false
app.use(router)
    .use(i18n)
    .use(createMetaManager()).use(metaPlugin)
    .mount('#app')
