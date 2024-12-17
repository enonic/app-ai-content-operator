import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {twJoin, twMerge} from 'tailwind-merge';

import AssistantIcon from '../../../base/AssistantIcon/AssistantIcon';

type Props = {
    className?: string;
    children: ReactNode;
    type: 'context' | 'error';
};

export default function SystemMessage({className, children, type}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className='shrink-0 text-enonic-blue-400' />
            <article className={twJoin('pt-1 text-sm leading-6')}>
                {type === 'error' ? (
                    <div className={twMerge('flex flex-col gap-x-2 gap-y-1', className)}>
                        <div className='align-baseline text-red-600 truncate text-xs'>{t('field.message.error')}</div>
                        <div className={twMerge('relative', 'col-span-2', className)}>{children}</div>
                    </div>
                ) : (
                    children
                )}
            </article>
        </div>
    );
}
