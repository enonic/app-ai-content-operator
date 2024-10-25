import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

export default function WelcomeMessage(): JSX.Element {
    const {t} = useTranslation();

    return <p className={clsx('p-0', 'text-lg text-center select-none', 'overflow-hidden')}>{t('text.greeting')}</p>;
}
