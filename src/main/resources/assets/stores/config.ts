import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';

export type Config = {
    serviceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    instructions: string;
};

export const $config = map<Config>({
    serviceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    instructions: '',
});

export const setServiceUrl = (serviceUrl: string): void => $config.setKey('serviceUrl', serviceUrl);
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
