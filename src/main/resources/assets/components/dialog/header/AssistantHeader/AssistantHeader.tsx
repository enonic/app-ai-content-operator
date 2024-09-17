import {useStore} from '@nanostores/react';
import clsx from 'clsx';

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
            className={clsx([
                'AssistantHeader',
                'grid grid-cols-mid-3 items-center',
                'h-10',
                'bg-enonic-gray-lighter',
                className,
            ])}
        >
            <NewChatButton className={isSettings ? 'invisible' : ''} disabled={isSettings} />
            <HeaderTitle className='drag-handle self-stretch' />
            <div className='text-right text-nowrap'>
                <SettingsButton />
                <CloseButton />
            </div>
        </div>
    );
}
