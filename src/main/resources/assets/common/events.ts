import {ConfigureEventData} from '../stores/data/ConfigureEventData';
import {UpdateEventData} from '../stores/data/EventData';
import {OpenDialogEventData} from '../stores/data/OpenDialogEventData';

export enum AiEvents {
    // Content Operator
    //   Outgoing
    DIALOG_SHOWN = 'AiContentOperatorDialogShownEvent',
    DIALOG_HIDDEN = 'AiContentOperatorDialogHiddenEvent',
    RESULT_APPLIED = 'AiContentOperatorResultAppliedEvent',
    INTERACTED = 'AiContentOperatorInteractionEvent',
    //   Incoming
    OPEN_DIALOG = 'AiContentOperatorOpenDialogEvent',
    CONFIGURE = 'AiContentOperatorConfigureEvent',
    // Common
    //   Incoming
    UPDATE_DATA = 'AiUpdateDataEvent',
}

export type EventHandler<T extends Event = Event> = (event: T) => void;
export type CustomEventHandler<T = unknown> = EventHandler<CustomEvent<T>>;

export type DispatchableAiEvents =
    | AiEvents.DIALOG_SHOWN
    | AiEvents.DIALOG_HIDDEN
    | AiEvents.RESULT_APPLIED
    | AiEvents.INTERACTED;

function createEventHandler<T>(handler: CustomEventHandler<T>): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event as CustomEvent<T>);
        }
    };
}

function createCustomEvent(type: DispatchableAiEvents, data?: unknown): CustomEvent {
    switch (type) {
        case AiEvents.RESULT_APPLIED:
            return new CustomEvent(type, {detail: {items: data}});
        case AiEvents.INTERACTED:
            return new CustomEvent(type, {detail: data});
        case AiEvents.DIALOG_SHOWN:
        case AiEvents.DIALOG_HIDDEN:
            return new CustomEvent(type);
    }
}

export function dispatch(type: DispatchableAiEvents, data?: unknown): void {
    window.dispatchEvent(createCustomEvent(type, data));
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

function addGlobalHandler<T>(eventType: AiEvents, handler: CustomEventHandler<T>): FnVoid {
    const eventHandler = createEventHandler(handler);
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}
