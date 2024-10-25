import {useStore} from '@nanostores/react';
import {twJoin, twMerge} from 'tailwind-merge';

import {$dialog} from '../../../../stores/dialog';
import CloseButton from '../CloseButton/CloseButton';
import HeaderTitle from '../HeaderTitle/HeaderTitle';
import NewChatButton from '../NewChatButton/NewChatButton';
import SettingsButton from '../SettingsButton/SettingsButton';

type Props = {
    className?: string;
};

export default function AssistantHeader({className}: Props): JSX.Element {
    const {view} = useStore($dialog, {keys: ['view']});
    const isSettings = view === 'settings';

    return (
        <div
            className={twMerge(
                'AssistantHeader',
                'grid grid-cols-mid-3 items-center',
                'h-10',
                'bg-enonic-gray-400er',
                className,
            )}
        >
            <NewChatButton className={twJoin(isSettings && 'invisible')} disabled={isSettings} />
            <HeaderTitle className='drag-handle self-stretch' />
            <div className='text-right text-nowrap'>
                <SettingsButton />
                <CloseButton />
            </div>
        </div>
    );
}
