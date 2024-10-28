import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import CloseButton from '../CloseButton/CloseButton';
import NewChatButton from '../NewChatButton/NewChatButton';

type Props = {
    className?: string;
};

export default function AssistantHeader({className}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <div
            className={twMerge(
                'AssistantHeader',
                'grid grid-cols-mid-3 items-center',
                'h-10',
                'bg-enonic-gray-100',
                className,
            )}
        >
            <NewChatButton />
            <div className='px-2 text-center leading-10 font-semibold drag-handle self-stretch'>{t('field.chat')}</div>
            <div className='text-right text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
