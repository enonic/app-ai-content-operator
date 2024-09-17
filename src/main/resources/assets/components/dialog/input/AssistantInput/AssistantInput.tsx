import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import UserIcon from '../../../shared/UserIcon/UserIcon';
import PromptArea from '../prompt/PromptArea/PromptArea';

export type Props = {
    className?: string;
};

export default function AssistantInput({className = ''}: Props): JSX.Element {
    const {t} = useTranslation();

    return (
        <div className={clsx(['grid gap-x-2 items-end', 'grid-cols-[auto_1fr]', 'w-full px-3'])}>
            <UserIcon className='mb-2' />
            <PromptArea className={className} />
            <p
                className={clsx([
                    'col-span-full',
                    'pt-2 pb-1',
                    'text-enonic-gray-light text-xs text-center text-nowrap select-none',
                    'overflow-hidden',
                ])}
            >
                {t('text.input.tip')}
            </p>
        </div>
    );
}
