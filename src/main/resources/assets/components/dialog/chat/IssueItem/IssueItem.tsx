import {twMerge} from 'tailwind-merge';

import {combineMessageValues} from '../../../../common/mentions';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    value: string | MultipleContentValue;
};

export default function IssueItem({className, value}: Props): React.ReactNode {
    return (
        <li className={twMerge('grid grid-cols-fit-1fr gap-x-2 gap-y-1', className)}>
            <ElementItemContent className='leading-6' content={combineMessageValues(value)} />
        </li>
    );
}
