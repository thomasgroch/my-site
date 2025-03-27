import { createI18n } from "vue-i18n";
import type { I18nOptions } from "vue-i18n";

// Import all locale files
import contactEn from './locales/contact.en.json';
import contactEs from './locales/contact.es.json';
import contactJp from './locales/contact.jp.json';
import contactPt from './locales/contact.pt.json';
import generalEn from './locales/general.en.json';
import generalEs from './locales/general.es.json';
import generalJp from './locales/general.jp.json';
import generalPt from './locales/general.pt.json';
import meetEn from './locales/meet.en.json';
import meetEs from './locales/meet.es.json';
import meetJp from './locales/meet.jp.json';
import meetPt from './locales/meet.pt.json';

type Messages = {
  [key: string]: {
    contact: typeof contactEn;
    general: typeof generalEn;
    meet: typeof meetEn;
  }
}

// Combine messages by language with a flat structure
const messages: Messages = {
  en: {
    contact: contactEn,
    general: generalEn,
    meet: meetEn
  },
  jp: {
    contact: contactJp,
    general: generalJp,
    meet: meetJp
  },
  pt: {
    contact: contactPt,
    general: generalPt,
    meet: meetPt
  },
  es: {
    contact: contactEs,
    general: generalEs,
    meet: meetEs
  }
}

const i18nConfig: I18nOptions = {
  legacy: false, // Set to false for Composition API
  locale: 'pt', // Default locale
  fallbackLocale: ['en', 'pt'], // Changed to array format
  globalInjection: true, // Inject $t, $tc, etc. into all components
  missingWarn: process.env.NODE_ENV === 'production' ? false : true, // Suppress warnings in production
  fallbackWarn: process.env.NODE_ENV === 'production' ? false : true, // Suppress fallback warnings in production
  warnHtmlMessage: false, // Disable warnings for HTML in translations
  messages
}

export const i18n = createI18n(i18nConfig);
export default i18n;

