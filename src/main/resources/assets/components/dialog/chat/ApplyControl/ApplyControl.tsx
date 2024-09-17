import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {animateGlow} from '../../../../common/animations';
import {dispatchApplyContent} from '../../../../common/events';
import {delay} from '../../../../common/func';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    name: string;
    content: string;
};

export default function ApplyControl({className, name, content}: Props): JSX.Element {
    const {t} = useTranslation();
    const [applying, setApplying] = useState(false);

    const handleApply = useCallback(() => {
        setApplying(true);
        dispatchApplyContent([{name, content}]);
        animateGlow(name);
        void delay(500).then(() => {
            setApplying(false);
        });
    }, [content]);

    return (
        <ActionButton
            className={clsx([`${applying ? 'text-enonic-green' : ''}`, className])}
            name={t('action.insert')}
            icon={applying ? 'check' : 'apply'}
            mode='compact'
            handleClick={handleApply}
        />
    );
}
