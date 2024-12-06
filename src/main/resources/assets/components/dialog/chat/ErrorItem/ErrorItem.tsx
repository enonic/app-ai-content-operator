import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {combineValues} from '../../../../common/messages';
import {MultipleValues} from '../../../../stores/data/MultipleContentValue';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    value: Optional<string | MultipleValues>;
};

export default function ErrorItem({className, value}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <li className={twMerge('grid grid-cols-fit-1fr gap-x-2 gap-y-1', className)}>
            <div className='align-baseline text-red-600 truncate'>
                <span className='text-xs'>{t('field.message.error')}</span>
            </div>
            <ElementItemContent className='leading-6' content={value && combineValues(value)} />
        </li>
    );
}
