import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {delay} from '../../../../common/func';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    content: string;
};

export default function CopyControl({className, content}: Props): JSX.Element {
    const {t} = useTranslation();
    const [copying, setCopying] = useState(false);

    const handleCopy = useCallback(() => {
        setCopying(true);
        void Promise.all([navigator.clipboard.writeText(content), delay(500)]).finally(() => {
            setCopying(false);
        });
    }, [content]);

    return (
        <ActionButton
            className={clsx([`${copying ? 'text-enonic-green' : ''}`, className])}
            name={t('action.copy')}
            icon={copying ? 'copySuccess' : 'copy'}
            mode='compact'
            handleClick={handleCopy}
        />
    );
}
