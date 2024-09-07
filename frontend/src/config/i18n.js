import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Load translations from a backend server
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Connect i18next with React
  .init({
    supportedLngs: ['en', 'pl'], // Specify supported languages
    fallbackLng: 'en', // Fallback language if the user language is not available
    debug: true, // Enable debugging (can be disabled in production)
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'querystring'],
      caches: ['localStorage', 'cookie'], // Where to store the user's language choice
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to translation files
    },
    react: {
      useSuspense: false, // Disable suspense for SSR or if you prefer manual loading
    },
  });

export default i18n;