import {useStore} from '@nanostores/react';
import debounce from 'lodash.debounce';
import {useEffect, useRef, useState} from 'react';
import Draggable from 'react-draggable';
import {twJoin} from 'tailwind-merge';

import {$dialog} from '../../../stores/dialog';
import {clearTarget} from '../../../stores/editor';
import {mountWebSocket} from '../../../stores/websocket';
import Resizable from '../../base/Resizable/Resizable';
import AssistantContent from '../AssistantContent/AssistantContent';
import AssistantHeader from '../header/AssistantHeader/AssistantHeader';
import './AssistantDialog.css';

export type Props = {
    className?: string;
};

export default function AssistantDialog({className = ''}: Props): React.ReactNode {
    const {hidden} = useStore($dialog, {keys: ['hidden']});
    const [dragging, setDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hidden) {
            return mountWebSocket();
        }
    }, [hidden]);

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
                className={twJoin(
                    'ai-content-operator',
                    'AssistantDialog',
                    'absolute',
                    'flex flex-col',
                    'text-base',
                    'leading-initial',
                    'bg-white',
                    'border',
                    'shadow-xl',
                    'z-[2000]',
                    dragging && 'opacity-80',
                    hidden && 'hidden',
                    className,
                )}
                ref={ref}
                onStart={() => clearTarget()}
            >
                <AssistantHeader className={dragging ? 'cursor-grabbing' : 'cursor-grab'} />
                <AssistantContent />
            </Resizable>
        </Draggable>
    );
}
