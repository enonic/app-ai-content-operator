import {t} from 'i18next';
import {Trans} from 'react-i18next';

import {toMentionElement} from '../../../../../plugins/withMentions';
import {Mention} from '../../../../../stores/data/Mention';
import MentionElement from '../../../input/prompt/MentionElement/MentionElement';

type Props = {
    topic: string;
    mentionInContext: Optional<Mention>;
};

export default function ContextMessagePhrase({topic, mentionInContext}: Props): React.ReactNode {
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

    const mentionElement = (
        <MentionElement
            element={toMentionElement(mentionInContext)}
            key={mentionInContext.label}
            className='animate-blink'
        />
    );
    return <Trans i18nKey='text.greeting.context.mention' components={[mentionElement]} />;
}
