import isEqual from 'lodash.isequal';
import {computed} from 'nanostores';

import ContextMessagePhrase from '../components/dialog/chat/system/ContextMessagePhrase/ContextMessagePhrase';
import WelcomeMessagePhrase from '../components/dialog/chat/system/WelcomeMessagePhrase/WelcomeMessagePhrase';
import {$chatState, addSystemMessage, ChatState} from './chat';
import {$config} from './config';
import {$mentionInContext, $topic} from './data';
import {Mention} from './data/Mention';

type SystemData = {
    name: string;
    topic: string;
    mentionInContext: Optional<Mention>;
    chatState: ChatState;
};

const $systemData = computed(
    [$topic, $mentionInContext, $config, $chatState],
    (topic, mentionInContext, config, chatState) => {
        return {name: config.user.fullName, topic, mentionInContext, chatState} satisfies SystemData;
    },
);

export function subscribeToSystemDataChanges(): void {
    $systemData.subscribe((systemData, oldSystemData) => {
        const isMentionChanges = !isEqual(systemData.mentionInContext, oldSystemData?.mentionInContext);
        const isTopicChanges = systemData.topic !== oldSystemData?.topic;
        const isNameChanges = systemData.name !== systemData?.name;
        const hasMention = systemData.mentionInContext != null;

        if (systemData.chatState !== 'ongoing') {
            if (isMentionChanges || isTopicChanges || isNameChanges || systemData.chatState === 'empty') {
                addWelcomeMessage();
            }
        } else if ((hasMention && isMentionChanges) || (!hasMention && isTopicChanges)) {
            addContextMessage();
        }
    });
}

function addWelcomeMessage(): void {
    const {name, topic, mentionInContext} = $systemData.get();
    addSystemMessage({
        type: 'context',
        node: <WelcomeMessagePhrase name={name} topic={topic} mentionInContext={mentionInContext} />,
    });
}

function addContextMessage(): void {
    const {topic, mentionInContext} = $systemData.get();
    addSystemMessage({
        type: 'context',
        node: <ContextMessagePhrase topic={topic} mentionInContext={mentionInContext} />,
    });
}
