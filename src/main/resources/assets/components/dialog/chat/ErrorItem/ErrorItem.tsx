import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {combineMessageValues} from '../../../../common/mentions';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    value: string | MultipleContentValue;
};

export default function ErrorItem({className, value}: Props): JSX.Element {
    const {t} = useTranslation();

    return (
        <li className={twMerge(clsx(['grid grid-cols-fit-1fr gap-x-2 gap-y-1', className]))}>
            <div className='align-baseline text-red-600 truncate'>
                <span className='text-xs'>{t('field.message.error')}</span>
            </div>
            <ElementItemContent className='leading-6' content={combineMessageValues(value)} />
        </li>
    );
}
