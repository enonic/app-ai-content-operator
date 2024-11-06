import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

const SUPPORTED_LOCALES = ['be', 'en', 'no', 'ru'];

function mapLocale(locale: string): Optional<string> {
    if (SUPPORTED_LOCALES.includes(locale)) {
        return locale;
    }

    try {
        const {language} = new Intl.Locale(locale);
        if (SUPPORTED_LOCALES.includes(language)) {
            return language;
        }
        return language === 'nb' ? 'no' : language;
    } catch (e) {
        return undefined;
    }
}

function normalizeLocales(locales: Optional<string[]>): string[] {
    return (
        locales
            ?.map(locale => mapLocale(locale))
            .filter(locale => locale != null)
            .filter((locale, index, arr) => arr.indexOf(locale) === index) || ['en']
    );
}

const locales = normalizeLocales(document.currentScript?.getAttribute('data-locales')?.split(','));
const assetURL = document.currentScript?.getAttribute('data-asset-url');
const localeAssetUrl = `${assetURL}/i18n/locales`;

void i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: locales[0],
        load: 'languageOnly',
        fallbackLng: locales.slice(1),
        backend: {
            loadPath: `${localeAssetUrl}/{{ns}}_{{lng}}.json`,
        },
        ns: ['phrases'],
    });

export default i18n;
