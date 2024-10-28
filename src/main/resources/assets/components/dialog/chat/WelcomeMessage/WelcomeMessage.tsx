import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {useEffect, useRef} from 'react';
import {Trans} from 'react-i18next';

import {toMentionElement} from '../../../../plugins/withMentions';
import {$config} from '../../../../stores/config';
import {$mentionInContext, $topic} from '../../../../stores/data';
import {Mention} from '../../../../stores/data/Mention';
import {$dialog, markWelcomed} from '../../../../stores/dialog';
import AssistantIcon from '../../../shared/AssistantIcon/AssistantIcon';
import MentionElement from '../../input/prompt/MentionElement/MentionElement';
import LoadingMessage from '../LoadingMessage/LoadingMessage';

function createTimedGreeting(name: string): React.ReactNode {
    const hours = new Date().getHours();
    const components = {
        name: (
            <span className='font-semibold italic' key='name'>
                {name}
            </span>
        ),
    };
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

function createContextMessage(topic: string, mentionInContext: Optional<Mention>): React.ReactNode {
    if (!mentionInContext) {
        if (!topic) {
            return t('text.greeting.context.all.unnamed');
        }
        const topicElements = (
            <span className='font-semibold' key='topic'>
                {topic}
            </span>
        );
        return <Trans i18nKey='text.greeting.context.all.named' components={[topicElements]} />;
    }

    const mentionElement = <MentionElement element={toMentionElement(mentionInContext)} />;
    return <Trans i18nKey='text.greeting.context.mention' components={[mentionElement]} />;
}

export default function WelcomeMessage(): React.ReactNode {
    const topic = useStore($topic);
    const mentionInContext = useStore($mentionInContext);
    const {hidden, welcomed} = useStore($dialog);
    const ref = useRef<HTMLElement | null>(null);

    const {user} = useStore($config, {keys: ['user']});
    const name = user.fullName;

    useEffect(() => {
        if (!hidden && !welcomed) {
            setTimeout(() => {
                markWelcomed();
            }, 800);
        }
    }, [hidden, welcomed]);

    return !welcomed ? (
        <LoadingMessage className={'first:mt-auto'} />
    ) : (
        <div className='flex gap-2 first:mt-auto overflow-hidden'>
            <AssistantIcon className='shrink-0 text-enonic-blue-light animate-slide-fade-in' />
            <article className='pt-1 leading-6 animate-slide-fade-in' ref={ref}>
                {createTimedGreeting(name)} {createContextMessage(topic, mentionInContext)}
            </article>
        </div>
    );
}
