import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import {animateScroll} from '../../../../common/animations';
import {REGULAR_SCREEN} from '../../../../common/device';
import {pickMessageValue} from '../../../../common/mentions';
import {getInputType, getStoredPathByDataAttrString} from '../../../../stores/data';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import {getPathLabel, pathToPrettifiedString} from '../../../../stores/utils/path';
import ElementItemContent from '../ElementItemContent/ElementItemContent';
import ElementItemControls from '../ElementItemControls/ElementItemControls';
import MessageSwitcher from '../MessageSwitcher/MessageSwitcher';

type Props = {
    className?: string;
    messageId: string;
    name: string;
    value: string | MultipleContentValue;
};

export default function ElementItem({className, messageId, name, value}: Props): React.ReactNode {
    const inputWithPath = getStoredPathByDataAttrString(name);
    const title = inputWithPath ? pathToPrettifiedString(inputWithPath) : '';
    const label = inputWithPath ? getPathLabel(inputWithPath) : name;
    const content = pickMessageValue(value);

    return (
        <li className={twMerge('group/item grid grid-cols-fit-fit-1fr gap-x-1 gap-y-1 hover:bg-slate-50', className)}>
            <button
                className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                title={title}
                onClick={() => animateScroll(name)}
            >
                <span className='text-xs'>{`${label}`}</span>
            </button>
            {typeof value !== 'string' && <MessageSwitcher messageId={messageId} name={name} content={value} />}
            <ElementItemControls
                className={clsx({'col-start-3 invisible group-hover/item:visible': REGULAR_SCREEN})}
                content={content}
                name={name}
            />
            <ElementItemContent className='col-span-3' content={content} type={getInputType(inputWithPath)} />
        </li>
    );
}
