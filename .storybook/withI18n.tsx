import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Decorator } from '@storybook/preact-vite';

import phrasesEn from '../src/main/resources/assets/i18n/locales/phrases_en.json';

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['phrases'],
    defaultNS: 'phrases',
    resources: { en: { phrases: phrasesEn } },
    interpolation: { escapeValue: false },
  });
}

export const withI18n: Decorator = (Story) => <Story />;
