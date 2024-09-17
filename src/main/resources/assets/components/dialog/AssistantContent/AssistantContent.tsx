import {useStore} from '@nanostores/react';

import {$dialog} from '../../../stores/dialog';
import ChatContainer from '../chat/ChatContainer/ChatContainer';
import SettingsContainer from '../settings/SettingsContainer/SettingsContainer';
import './AssistantContent.css';

export default function AssistantContent(): JSX.Element {
    const {view} = useStore($dialog, {keys: ['view']});

    switch (view) {
        case 'chat':
            return <ChatContainer className='AssistantContent' />;
        case 'settings':
            return <SettingsContainer className='AssistantContent' />;
        case 'none':
            return <></>;
    }
}
