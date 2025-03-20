import { createI18n } from "vue-i18n";

// Import all locale files
import contactEn from './locales/contact.en.json';
import contactJp from './locales/contact.jp.json';
import contactPt from './locales/contact.pt.json';
import generalEn from './locales/general.en.json';
import generalJp from './locales/general.jp.json';
import generalPt from './locales/general.pt.json';
import meetEn from './locales/meet.en.json';
import meetEs from './locales/meet.es.json';
import meetPt from './locales/meet.pt.json';

// Combine messages by language with a flat structure
const messages = {
  en: {
    contact: contactEn,    // Without spread
    general: generalEn,
    meet: meetEn,
  },
  jp: {
    contact: generalJp,
    general: contactJp,
  },
  pt: {
    contact: contactPt,
    general: generalPt,
    meet: meetPt,
  },
  es: {
    meet: meetEs,
  },
}

const i18n = createI18n({
  legacy: false, // Set to false for Composition API
  locale: 'pt', // Default locale
  fallbackLocale: {
    default: 'en',
    'es': ['en', 'pt']
  }, // Fallback chain
  globalInjection: true, // Inject $t, $tc, etc. into all components
  missingWarn: process.env.NODE_ENV === 'production' ? false : true, // Suppress warnings in production
  fallbackWarn: process.env.NODE_ENV === 'production' ? false : true, // Suppress fallback warnings in production
  warnHtmlMessage: false, // Disable warnings for HTML in translations
  messages
})

export default i18n;
