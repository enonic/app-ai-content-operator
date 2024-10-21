import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {$data, getPersistedData, getStoredPathByDataAttrString, setPersistedData, setValueByPath} from '../stores/data';
import {ApplyMessage} from '../stores/data/ApplyMessage';
import {ContentData} from '../stores/data/ContentData';

export enum AiEvents {
    // Content Operator
    //   Outgoing
    RENDERED = 'AiContentOperatorRenderedEvent',
    DIALOG_SHOWN = 'AiContentOperatorDialogShownEvent',
    DIALOG_HIDDEN = 'AiContentOperatorDialogHiddenEvent',
    RESULT_APPLIED = 'AiContentOperatorResultAppliedEvent',
    //   Incoming
    OPEN_DIALOG = 'AiContentOperatorOpenDialogEvent',
    CONFIGURE = 'AiContentOperatorConfigureEvent',
    // Common
    //   Incoming
    UPDATE_DATA = 'AiUpdateDataEvent',
}

export type EventHandler<T extends Event = Event> = (event: T) => void;
export type CustomEventHandler = EventHandler<CustomEvent>;

export type DispatchableAiEvents =
    | AiEvents.RENDERED
    | AiEvents.DIALOG_SHOWN
    | AiEvents.DIALOG_HIDDEN
    | AiEvents.RESULT_APPLIED;

function createEventHandler(handler: CustomEventHandler): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event);
        }
    };
}

function createCustomEvent(type: DispatchableAiEvents): CustomEvent {
    switch (type) {
        case AiEvents.RESULT_APPLIED:
            return new CustomEvent(type, {detail: {result: $data.get().persisted}});
        case AiEvents.RENDERED:
        case AiEvents.DIALOG_SHOWN:
        case AiEvents.DIALOG_HIDDEN:
            return new CustomEvent(type);
    }
}

export function dispatch(type: DispatchableAiEvents): void {
    window.dispatchEvent(createCustomEvent(type));
}

export function addGlobalUpdateDataHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.UPDATE_DATA, handler);
}

export function addGlobalConfigureHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.CONFIGURE, handler);
}

export function addGlobalOpenDialogHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.OPEN_DIALOG, handler);
}

export function dispatchResultApplied(entries: ApplyMessage[]): void {
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
        dispatch(AiEvents.RESULT_APPLIED);
    }
}

function addGlobalHandler(eventType: AiEvents, handler: CustomEventHandler): FnVoid {
    const eventHandler = createEventHandler(handler);
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}
