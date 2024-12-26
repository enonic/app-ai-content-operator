import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import PromptArea from '../prompt/PromptArea/PromptArea';

export type Props = {
    className?: string;
};

export default function AssistantInput({className = ''}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <div className={twJoin('flex flex-col w-full px-3')}>
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
