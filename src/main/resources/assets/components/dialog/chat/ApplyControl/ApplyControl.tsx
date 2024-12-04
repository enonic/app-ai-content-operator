import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {dispatchResultApplied} from '../../../../common/events';
import {delay} from '../../../../common/func';
import ActionButton from '../../../base/ActionButton/ActionButton';

type Props = {
    className?: string;
    name: string;
    content: string;
};

export default function ApplyControl({className, name, content}: Props): React.ReactNode {
    const {t} = useTranslation();
    const [applying, setApplying] = useState(false);

    const handleApply = useCallback(() => {
        setApplying(true);
        dispatchResultApplied([{path: name, text: content}]);
        void delay(500).then(() => {
            setApplying(false);
        });
    }, [content]);

    return (
        <ActionButton
            className={clsx(applying && 'text-enonic-green', className)}
            name={t('action.insert')}
            icon={applying ? 'check' : 'apply'}
            mode='icon-with-title'
            clickHandler={handleApply}
        />
    );
}
