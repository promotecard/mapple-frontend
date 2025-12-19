import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './i18n/locales/es.json'
import en from './i18n/locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          ...es,
          menu: {
            dashboard: 'Panel',
            payments: 'Pagos',
          },
        },
      },
      en: {
        translation: {
          ...en,
          menu: {
            dashboard: 'Dashboard',
            payments: 'Payments',
          },
        },
      },
    },
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
