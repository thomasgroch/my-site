import { createI18n } from "vue3-i18n";
import { messages } from "vite-i18n-resources";
console.log(messages)
const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  fallbackLocale: 'pt',
  globalInjection: true,
  silentTranslationWarn: true,
  messages
})

export default i18n;
