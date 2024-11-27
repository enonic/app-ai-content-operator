import {ApplyMessage} from '../stores/data/ApplyMessage';
import {ConfigureEventData} from '../stores/data/ConfigureEventData';
import {UpdateEventData} from '../stores/data/EventData';
import {OpenDialogEventData} from '../stores/data/OpenDialogEventData';

export enum AiEvents {
    // Content Operator
    //   Outgoing
    DIALOG_SHOWN = 'AiContentOperatorDialogShownEvent',
    DIALOG_HIDDEN = 'AiContentOperatorDialogHiddenEvent',
    RESULT_APPLIED = 'AiContentOperatorResultAppliedEvent',
    CONTEXT_CHANGED = 'AiContentOperatorContextChangedEvent',
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
    | AiEvents.CONTEXT_CHANGED;

function createEventHandler<T>(handler: CustomEventHandler<T>): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event as CustomEvent<T>);
        }
    };
}

export function dispatchDialogEvent(type: AiEvents.DIALOG_SHOWN | AiEvents.DIALOG_HIDDEN): void {
    window.dispatchEvent(new CustomEvent(type));
}

export function dispatchResultApplied(items: ApplyMessage[]): void {
    window.dispatchEvent(new CustomEvent(AiEvents.RESULT_APPLIED, {detail: {items}}));
}

export function dispatchContextChanged(context: Optional<string>): void {
    window.dispatchEvent(new CustomEvent(AiEvents.CONTEXT_CHANGED, {detail: {context}}));
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
