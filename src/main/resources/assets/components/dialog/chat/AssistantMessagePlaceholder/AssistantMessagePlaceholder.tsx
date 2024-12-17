import {useStore} from '@nanostores/react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import {isNonOptional} from '../../../../common/data';
import {dispatchInteracted} from '../../../../common/events';
import {$fieldDescriptors} from '../../../../stores/data';
import {ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import {FieldDescriptor} from '../../../../stores/data/FieldDescriptor';
import ActionButton from '../../../base/ActionButton/ActionButton';

type Props = {
    content: Omit<ModelChatMessageContent, 'generationResult'>;
};

export default function AssistantMessagePlaceholder({content}: Props): React.ReactNode {
    const {t} = useTranslation();
    const fieldDescriptors = useStore($fieldDescriptors);

    const analyzedFieldsDescriptors: FieldDescriptor[] = Object.keys(content.analysisResult)
        .map(path => fieldDescriptors.find(descriptor => descriptor.name === path))
        .filter(isNonOptional);

    const count = analyzedFieldsDescriptors.length;

    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <ActionButton
                className='max-w-none justify-start min-h-8 h-auto px-2 py-1.5'
                icon={expanded ? 'expand' : 'right'}
                size='sm'
                clickHandler={() => setExpanded(!expanded)}
            >
                <span
                    className={twJoin([
                        'bg-middle-gradient bg-text-gradient-size from-black to-enonic-gray-400',
                        'text-transparent bg-clip-text animate-move-gradient',
                        'pl-1 text-sm text-left',
                    ])}
                >
                    {t(
                        count > 1
                            ? 'field.message.assistant.placeholder.multiple'
                            : 'field.message.assistant.placeholder.single',
                        {name: analyzedFieldsDescriptors.at(0)?.label, count: count - 1},
                    )}
                </span>
            </ActionButton>
            <ul className={twJoin('flex flex-col gap-1 pl-6 divide-y', !expanded && 'hidden')}>
                {analyzedFieldsDescriptors.map(({name, label, displayName}) => (
                    <li key={name}>
                        <button
                            className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                            title={displayName}
                            onClick={() => dispatchInteracted(name)}
                        >
                            <span className='text-xs'>{label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}
