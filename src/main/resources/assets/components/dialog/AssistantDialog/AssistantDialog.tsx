import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import debounce from 'lodash.debounce';
import {useEffect, useRef, useState} from 'react';
import Draggable from 'react-draggable';

import {$visible} from '../../../stores/dialog';
import {clearTarget} from '../../../stores/editor';
import Resizable from '../../shared/Resizable/Resizable';
import AssistantContent from '../AssistantContent/AssistantContent';
import Header from '../header/AssistantHeader/AssistantHeader';
import './AssistantDialog.css';

export type Props = {
    className?: string;
};

export default function AssistantDialog({className = ''}: Props): JSX.Element {
    const visible = useStore($visible);
    const [dragging, setDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const liveFrame = document.querySelector<HTMLElement>('.live-edit-frame');
        liveFrame?.style.setProperty('pointer-events', dragging ? 'none' : null);
    }, [dragging]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (
                event.target instanceof HTMLElement &&
                ref.current &&
                !ref.current.contains(event.target) &&
                !event.target.classList.contains('EnonicAiMentionsList') &&
                !document.querySelector('.EnonicAiMentionsList')?.contains(event.target)
            ) {
                clearTarget();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleResize: () => void = debounce((): void => {
            console.log('Resize AssistantDialog');
            ['transform', 'width', 'height'].forEach(prop => {
                ref.current?.style.removeProperty(prop);
            });
        }, 200);

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Draggable
            bounds='body'
            onStart={() => {
                setDragging(true);
                clearTarget();
            }}
            onStop={() => {
                setDragging(false);
            }}
            handle='.drag-handle'
            nodeRef={ref}
        >
            <Resizable
                className={clsx(
                    'enonic-ai',
                    'AssistantDialog',
                    'absolute',
                    'flex flex-col',
                    'leading-initial',
                    'bg-white',
                    'border',
                    'shadow-xl',
                    'z-[2000]',
                    {'opacity-80': dragging},
                    {hidden: !visible},
                    className,
                )}
                ref={ref}
                onStart={() => clearTarget()}
            >
                <Header className={dragging ? 'cursor-grabbing' : 'cursor-grab'} />
                <AssistantContent />
            </Resizable>
        </Draggable>
    );
}
