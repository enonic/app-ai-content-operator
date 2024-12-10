import {useStore} from '@nanostores/react';
import {twJoin, twMerge} from 'tailwind-merge';

import {REGULAR_SCREEN} from '../../../../common/device';
import {dispatchInteracted} from '../../../../common/events';
import {pickValue} from '../../../../common/messages';
import {$allFormItemsWithPaths} from '../../../../stores/data';
import {MultipleValues} from '../../../../stores/data/MultipleContentValue';
import {findPathByDataAttrString} from '../../../../stores/utils/data';
import {getInputType} from '../../../../stores/utils/input';
import {getPathLabel, pathToPrettifiedString} from '../../../../stores/utils/path';
import ElementItemContent from '../ElementItemContent/ElementItemContent';
import ElementItemControls from '../ElementItemControls/ElementItemControls';
import MessageSwitcher from '../MessageSwitcher/MessageSwitcher';

type Props = {
    className?: string;
    messageId: string;
    name: string;
    last: boolean;
    value: Optional<string | MultipleValues>;
};

export default function ElementItem({className, messageId, name, value, last}: Props): React.ReactNode {
    const allItems = useStore($allFormItemsWithPaths);

    const inputWithPath = findPathByDataAttrString(allItems, name);
    const title = inputWithPath ? pathToPrettifiedString(inputWithPath) : '';
    const label = inputWithPath ? getPathLabel(inputWithPath) : name;
    const content = value && pickValue(value);
    const type = getInputType(inputWithPath);

    return (
        <li className={twMerge('group/item grid grid-cols-fit-fit-1fr gap-x-1 gap-y-1 hover:bg-slate-50', className)}>
            <button
                className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                title={title}
                onClick={() => dispatchInteracted(name)}
            >
                <span className='text-xs'>{`${label}`}</span>
            </button>
            {content && typeof value !== 'string' && (
                <MessageSwitcher messageId={messageId} name={name} content={value} />
            )}
            {content && (
                <ElementItemControls
                    className={twJoin('col-start-3', REGULAR_SCREEN && !last && 'invisible group-hover/item:visible')}
                    content={content}
                    name={name}
                    type={type}
                />
            )}
            <ElementItemContent className='col-span-3' content={content} type={type} />
        </li>
    );
}
