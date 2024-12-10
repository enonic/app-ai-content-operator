import {twMerge} from 'tailwind-merge';

import {combineValues} from '../../../../common/messages';
import {MultipleValues} from '../../../../stores/data/MultipleContentValue';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    value: Optional<string | MultipleValues>;
};

export default function IssueItem({className, value}: Props): React.ReactNode {
    return (
        <li className={twMerge('grid grid-cols-fit-1fr gap-x-2 gap-y-1', className)}>
            <ElementItemContent className='leading-6' content={value && combineValues(value)} />
        </li>
    );
}
