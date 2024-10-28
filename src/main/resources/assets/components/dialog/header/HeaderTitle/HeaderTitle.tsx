import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
};

export default function HeaderTitle({className}: Props): React.ReactNode {
    const {t} = useTranslation();

    const title = t('field.chat');

    return (
        <div
            className={twMerge(
                'flex justify-center items-center flex-nowrap',
                'px-2',
                'text-sm text-enonic-gray-600 text-center',
                className,
            )}
        >
            <span>{title}</span>
        </div>
    );
}
