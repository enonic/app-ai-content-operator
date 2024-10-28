import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import UserIcon from '../../../shared/UserIcon/UserIcon';
import PromptArea from '../prompt/PromptArea/PromptArea';

export type Props = {
    className?: string;
};

export default function AssistantInput({className = ''}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <div className={twJoin('grid gap-x-2 items-end', 'grid-cols-[auto_1fr]', 'w-full px-3')}>
            <UserIcon className='mb-2' />
            <PromptArea className={className} />
            <p
                className={twJoin(
                    'col-span-full',
                    'pt-2 pb-1',
                    'text-enonic-gray-400 text-xs text-center text-nowrap select-none',
                    'overflow-hidden',
                )}
            >
                {t('text.input.tip')}
            </p>
        </div>
    );
}
