import {deepMap} from 'nanostores';

import {Mode} from '../../lib/shared/modes';
import {syncWithLocalStorage} from './storage';

export type Settings = {
    mode: Mode;
};

export const $settings = deepMap<Settings>({
    mode: 'balanced',
});

syncWithLocalStorage<Settings>($settings, 'settings');

export const setMode = (mode: Mode): void => $settings.setKey('mode', mode);
