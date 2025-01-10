import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {dispatchResultApplied} from '../../../../../common/events';
import {delay} from '../../../../../common/func';
import {messageContentToValues, pickValue} from '../../../../../common/messages';
import {ApplyMessage} from '../../../../../stores/data/ApplyMessage';
import {ModelChatMessageContent} from '../../../../../stores/data/ChatMessage';
import {MultipleValues} from '../../../../../stores/data/MultipleContentValue';
import ActionButton from '../../../../base/ActionButton/ActionButton';

type Props = {
    className?: string;
    content: ModelChatMessageContent;
};

function extractItems(content: ModelChatMessageContent): ApplyMessage[] {
    return Object.entries(messageContentToValues(content))
        .filter((value): value is [string, string | MultipleValues] => value[1] != null)
        .map(([name, value]) => ({
            path: name,
            text: pickValue(value),
        }));
}

export default function ApplyControl({className, content}: Props): React.ReactNode {
    const {t} = useTranslation();
    const [applying, setApplying] = useState(false);

    const handleApply = useCallback(() => {
        setApplying(true);

        const items = extractItems(content);
        dispatchResultApplied(items);

        void delay(500).then(() => {
            setApplying(false);
        });
    }, [content]);

    return (
        <ActionButton
            className={clsx(applying && 'text-enonic-green', className)}
            name={t('action.insertAll')}
            icon={applying ? 'check' : 'applyAll'}
            mode='icon-with-title'
            clickHandler={handleApply}
        />
    );
}
