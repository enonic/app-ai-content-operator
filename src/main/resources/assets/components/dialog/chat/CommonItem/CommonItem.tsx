import {twMerge} from 'tailwind-merge';

import {combineMessageValues} from '../../../../common/mentions';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import CommonItemContent from '../CommonItemContent/CommonItemContent';

type Props = {
    className?: string;
    last: boolean;
    value: string | MultipleContentValue;
};

export default function CommonItem({className, last, value}: Props): React.ReactNode {
    return (
        <li className={twMerge('grid grid-cols-1 gap-y-1', className)}>
            <CommonItemContent content={combineMessageValues(value)} last={last} />
        </li>
    );
}
