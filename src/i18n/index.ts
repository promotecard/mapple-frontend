import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonES from './es/common.json';
import authES from './es/auth.json';
import parentsES from './es/parents.json';

import commonEN from './en/common.json';
import authEN from './en/auth.json';
import parentsEN from './en/parents.json';

const resources = {
  es: {
    common: commonES,
    auth: authES,
    parents: parentsES,
  },
  en: {
    common: commonEN,
    auth: authEN,
    parents: parentsEN,
  },
};

const getInitialLanguage = () => {
  const storedLang = localStorage.getItem('language');
  if (storedLang) return storedLang;

  const browserLang = navigator.language.split('-')[0];
  if (['es', 'en'].includes(browserLang)) return browserLang;

  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'es',
    ns: ['common', 'auth', 'parents'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
