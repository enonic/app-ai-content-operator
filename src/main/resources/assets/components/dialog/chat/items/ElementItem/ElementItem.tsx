import {twJoin, twMerge} from 'tailwind-merge';

import {REGULAR_SCREEN} from '../../../../../common/device';
import {dispatchInteracted} from '../../../../../common/events';
import {pickValue} from '../../../../../common/messages';
import {FieldDescriptor} from '../../../../../stores/data/FieldDescriptor';
import {MultipleValues} from '../../../../../stores/data/MultipleContentValue';
import ElementItemControls from '../../controls/ElementItemControls/ElementItemControls';
import ElementItemSwitchControls from '../../controls/ElementItemSwitchControls/ElementItemSwitchControls';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    messageId: string;
    descriptor: FieldDescriptor;
    last: boolean;
    value: Optional<string | MultipleValues>;
};

export default function ElementItem({className, messageId, descriptor, value, last}: Props): React.ReactNode {
    const {name, label, displayName, type} = descriptor;
    const content = value && pickValue(value);

    return (
        <li className={twMerge('group/item grid grid-cols-fit-fit-1fr gap-x-1 gap-y-1 hover:bg-slate-50', className)}>
            <button
                className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                title={displayName}
                onClick={() => dispatchInteracted(name)}
            >
                <span className='text-xs'>{label}</span>
            </button>
            {content && typeof value !== 'string' && (
                <ElementItemSwitchControls messageId={messageId} name={name} content={value} />
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
