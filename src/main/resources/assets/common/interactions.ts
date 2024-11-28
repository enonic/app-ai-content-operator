import {AiEvents, dispatch} from './events';

export type InteractionType = 'click';

export function notifyInteracted(path: string, interaction: InteractionType = 'click'): void {
    dispatchAnimate(path, interaction);
}

function dispatchAnimate(path: string, interaction: InteractionType): void {
    dispatch(AiEvents.INTERACTED, {path, interaction});
}
