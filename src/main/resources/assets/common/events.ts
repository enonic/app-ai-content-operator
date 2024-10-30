import {SPECIAL_NAMES} from '../../lib/shared/prompts';
import {$data, getPersistedData, getStoredPathByDataAttrString, setPersistedData, setValueByPath} from '../stores/data';
import {ApplyMessage} from '../stores/data/ApplyMessage';
import {ConfigureEventData} from '../stores/data/ConfigureEventData';
import {ContentData} from '../stores/data/ContentData';
import {UpdateEventData} from '../stores/data/EventData';
import {OpenDialogEventData} from '../stores/data/OpenDialogEventData';

export enum AiEvents {
    // Content Operator
    //   Outgoing
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
export type CustomEventHandler<T = unknown> = EventHandler<CustomEvent<T>>;

export type DispatchableAiEvents = AiEvents.DIALOG_SHOWN | AiEvents.DIALOG_HIDDEN | AiEvents.RESULT_APPLIED;

function createEventHandler<T>(handler: CustomEventHandler<T>): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event as CustomEvent<T>);
        }
    };
}

function createCustomEvent(type: DispatchableAiEvents): CustomEvent {
    switch (type) {
        case AiEvents.RESULT_APPLIED:
            return new CustomEvent(type, {detail: {result: $data.get().persisted}});
        case AiEvents.DIALOG_SHOWN:
        case AiEvents.DIALOG_HIDDEN:
            return new CustomEvent(type);
    }
}

export function dispatch(type: DispatchableAiEvents): void {
    window.dispatchEvent(createCustomEvent(type));
}

export function addGlobalUpdateDataHandler(handler: CustomEventHandler<UpdateEventData>): FnVoid {
    return addGlobalHandler(AiEvents.UPDATE_DATA, handler);
}

export function addGlobalConfigureHandler(handler: CustomEventHandler<ConfigureEventData>): FnVoid {
    return addGlobalHandler(AiEvents.CONFIGURE, handler);
}

export function addGlobalOpenDialogHandler(handler: CustomEventHandler<OpenDialogEventData>): FnVoid {
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

function addGlobalHandler<T>(eventType: AiEvents, handler: CustomEventHandler<T>): FnVoid {
    const eventHandler = createEventHandler(handler);
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}
