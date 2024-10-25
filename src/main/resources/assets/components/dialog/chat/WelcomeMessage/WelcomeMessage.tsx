import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {useEffect} from 'react';
import {Trans} from 'react-i18next';

import {findMentionByPath} from '../../../../common/mentions';
import {$config} from '../../../../stores/config';
import {$mentions, getStoredPathByDataAttrString} from '../../../../stores/data';
import {Mention} from '../../../../stores/data/Mention';
import {$dialog, markVisited} from '../../../../stores/dialog';
import AssistantIcon from '../../../shared/AssistantIcon/AssistantIcon';
import LoadingMessage from '../LoadingMessage/LoadingMessage';

function getTimedGreeting(name: string): React.ReactNode {
    const hours = new Date().getHours();
    const components = {name: <b key='name'>{name}</b>};
    switch (true) {
        case hours < 6:
            return <Trans i18nKey='text.greeting.recurring.night' components={components} />;
        case hours < 12:
            return <Trans i18nKey='text.greeting.recurring.morning' components={components} />;
        case hours < 18:
            return <Trans i18nKey='text.greeting.recurring.afternoon' components={components} />;
        default:
            return <Trans i18nKey='text.greeting.recurring.evening' components={components} />;
    }
}

function getContext(contextPath: Optional<string>, allMentions: Mention[]): React.ReactNode {
    const path = contextPath && getStoredPathByDataAttrString(contextPath);
    const mention = path && findMentionByPath(allMentions, path);
    if (!mention) {
        return t('text.greeting.context.all');
    }
    console.log(mention);
    const name = mention.prettified;
    return <Trans i18nKey='text.greeting.context.mention' components={[<b key='mention'>{name}</b>]} />;
}

export default function WelcomeMessage(): JSX.Element {
    const allMentions = useStore($mentions);
    const {firstTime, contextPath} = useStore($dialog, {keys: ['firstTime', 'contextPath']});

    const {user} = useStore($config, {keys: ['user']});
    const name = user.fullName;

    useEffect(() => {
        setTimeout(() => {
            markVisited();
        }, 1600);
    }, []);

    return firstTime ? (
        <LoadingMessage className={'first:mt-auto'} />
    ) : (
        <div className='flex gap-2 first:mt-auto'>
            <AssistantIcon className='shrink-0 text-enonic-blue-light' />
            <article className='pt-2'>
                {getTimedGreeting(name)} {getContext(contextPath, allMentions)}
            </article>
        </div>
    );
}
