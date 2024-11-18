import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {Fragment} from 'react';
import {twJoin} from 'tailwind-merge';

import {$context, resetContext} from '../../../../stores/context';
import {getAllPathsFromString, pathToString} from '../../../../stores/utils/path';
import ActionButton from '../../../shared/ActionButton/ActionButton';
import ContextItem from '../ContextItem/ContextItem';

export default function ContextControl(): React.ReactNode {
    const context = useStore($context);
    const paths = context ? getAllPathsFromString(context) : [];
    const isEmpty = paths.length === 0;

    return (
        <div
            className={twJoin(
                'flex gap-0.5 justify-start items-center',
                'box-content',
                'mx-5',
                'border border-gray-200 rounded-md',
                'text-xs',
                'transition-all duration-200 ease-in-out',
                isEmpty ? 'h-0 -mb-1 opacity-0 pointer-events-none' : 'h-6 mb-0 opacity-100',
            )}
        >
            <ActionButton
                name={t('action.resetContext')}
                mode='icon-with-title'
                size='sm'
                icon='trash'
                clickHandler={resetContext}
            />
            <span className='inline-block border-l border-gray-200 mr-1 h-[calc(100%-0.5rem)]'></span>
            <span className='text-enonic-gray-400 cursor-default select-none'>{t('field.context')}</span>
            <span className='inline-block border-l border-gray-200 mx-1 h-[calc(100%-0.5rem)]'></span>
            <div className='flex items-center w-full overflow-hidden'>
                {paths.map((path, i) => (
                    <Fragment key={pathToString(path)}>
                        <span className='text-enonic-gray-400 cursor-default select-none flex-shrink-0'>/</span>
                        <ContextItem
                            path={path}
                            last={i === paths.length - 1}
                            className={twJoin(
                                'max-w-none min-w-6',
                                i === paths.length - 1 ? 'flex-1-0-auto justify-start' : 'shrink',
                            )}
                        />
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
