import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';

export type Config = {
    sharedSocketUrl: string;
    wsServiceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    instructions: string;
};

export const $config = map<Config>({
    sharedSocketUrl: '',
    wsServiceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    instructions: '',
});

export const setSharedSocketUrl = (sharedSocketUrl: string): void => $config.setKey('sharedSocketUrl', sharedSocketUrl);
export const setWsServiceUrl = (wsServiceUrl: string): void => $config.setKey('wsServiceUrl', wsServiceUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setInstructions = (instructions: string): void => $config.setKey('instructions', instructions);

export const isConfigured = (): boolean => !!$config.get().sharedSocketUrl || !!$config.get().wsServiceUrl;

addGlobalConfigureHandler(event => {
    const {user, instructions} = event.detail.payload;

    if (user) {
        setUser(user);
    }
    if (instructions) {
        setInstructions(instructions);
    }
});
