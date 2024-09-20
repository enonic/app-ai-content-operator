import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {$data, getPersistedData, getStoredPathByDataAttrString, setPersistedData, setValueByPath} from '../stores/data';
import {ApplyMessage} from '../stores/data/ApplyMessage';
import {ContentData} from '../stores/data/ContentData';

export enum EnonicAiEvents {
    // Content Operator
    RENDER = 'EnonicAiContentOperatorRenderEvent',
    SHOW = 'EnonicAiContentOperatorShowEvent',
    HIDE = 'EnonicAiContentOperatorHideEvent',
    APPLY = 'EnonicAiContentOperatorApplyEvent',
    OPEN_DIALOG = 'EnonicAiContentOperatorOpenDialogEvent',
    CONFIG = 'EnonicAiContentOperatorConfigEvent',
    // Common
    DATA_SENT = 'EnonicAiDataSentEvent',
}

export type EventHandler<T extends Event = Event> = (event: T) => void;
export type CustomEventHandler = EventHandler<CustomEvent>;

export type DispatchableEnonicAiEvents =
    | EnonicAiEvents.RENDER
    | EnonicAiEvents.SHOW
    | EnonicAiEvents.HIDE
    | EnonicAiEvents.APPLY;

function createEventHandler(handler: CustomEventHandler): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event);
        }
    };
}

function createCustomEvent(type: DispatchableEnonicAiEvents): CustomEvent {
    switch (type) {
        case EnonicAiEvents.APPLY:
            return new CustomEvent(type, {detail: {result: $data.get().persisted}});
        case EnonicAiEvents.RENDER:
        case EnonicAiEvents.SHOW:
        case EnonicAiEvents.HIDE:
            return new CustomEvent(type);
    }
}

export function dispatch(type: DispatchableEnonicAiEvents): void {
    window.dispatchEvent(createCustomEvent(type));
}

export function addGlobalDataSentHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(EnonicAiEvents.DATA_SENT, handler);
}

export function addGlobalConfigHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(EnonicAiEvents.CONFIG, handler);
}

export function addGlobalOpenDialogHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(EnonicAiEvents.OPEN_DIALOG, handler);
}

export function dispatchApplyContent(entries: ApplyMessage[]): void {
    const persistedData = getPersistedData();
    if (!persistedData) {
        return;
    }

    const newData = structuredClone<ContentData>(persistedData);
    let isAnyChanged = false;

    entries.forEach(({name, content}) => {
        if (name === SPECIAL_NAMES.topic) {
            newData.topic = content;
            isAnyChanged = true;
            return;
        }

        const path = getStoredPathByDataAttrString(name);
        if (path) {
            setValueByPath({v: content}, path, newData);
            isAnyChanged = true;
            return;
        }

        // handle value not updated
        console.warn('No path found for:', name);
    });

    if (isAnyChanged) {
        setPersistedData(newData);
        dispatch(EnonicAiEvents.APPLY);
    }
}

function addGlobalHandler(eventType: EnonicAiEvents, handler: CustomEventHandler): FnVoid {
    const eventHandler = createEventHandler(handler);
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}
