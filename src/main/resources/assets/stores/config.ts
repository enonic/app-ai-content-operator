import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';

export type Config = {
    sharedSocketUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    instructions: string;
};

export const $config = map<Config>({
    sharedSocketUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    instructions: '',
});

export const setSharedSocketUrl = (sharedSocketUrl: string): void => $config.setKey('sharedSocketUrl', sharedSocketUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setInstructions = (instructions: string): void => $config.setKey('instructions', instructions);

addGlobalConfigureHandler(event => {
    const {user, instructions} = event.detail.payload;

    if (user) {
        setUser(user);
    }
    if (instructions) {
        setInstructions(instructions);
    }
});
