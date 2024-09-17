import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

import {setLocales} from '../stores/config';

const locales = document.currentScript?.getAttribute('data-locales')?.split(',') || ['en'];
const assetURL = document.currentScript?.getAttribute('data-asset-url');
const localeAssetUrl = `${assetURL}/i18n/locales`;

setLocales(locales);

void i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        // strategy to define which language codes to lookup, e.g. 'en-US' -> 'en'
        load: 'languageOnly',
        // locale to use
        lng: locales[0],
        // language to use if translations in user language are not available
        fallbackLng: locales.slice(1),
        backend: {
            // to load phrases from assets folder
            loadPath: `${localeAssetUrl}/{{ns}}_{{lng}}.json`,
        },
        // namespace for localization files names, e.g. phrases_en.json
        ns: ['phrases'],
    });

export default i18n;
