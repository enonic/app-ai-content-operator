import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {delay} from '../../../../common/func';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    content: string;
    type?: 'text' | 'html';
};

export default function CopyControl({className, content, type}: Props): React.ReactNode {
    const {t} = useTranslation();
    const [copying, setCopying] = useState(false);

    const handleCopy = useCallback(() => {
        setCopying(true);

        const copyPromise =
            type === 'html'
                ? navigator.clipboard.write([
                      new ClipboardItem({
                          'text/plain': new Blob([content], {type: 'text/plain'}),
                          'text/html': new Blob([content], {type: 'text/html'}),
                      }),
                  ])
                : navigator.clipboard.writeText(content);

        void Promise.all([copyPromise, delay(500)]).finally(() => {
            setCopying(false);
        });
    }, [content]);

    return (
        <ActionButton
            className={clsx(copying && 'text-enonic-green', className)}
            name={t('action.copy')}
            icon={copying ? 'copySuccess' : 'copy'}
            mode='compact'
            clickHandler={handleCopy}
        />
    );
}
