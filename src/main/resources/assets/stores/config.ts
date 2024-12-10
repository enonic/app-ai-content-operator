import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';

export type Config = {
    wsServiceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    instructions: string;
};

export const $config = map<Config>({
    wsServiceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    instructions: '',
});

export const setWsServiceUrl = (wsServiceUrl: string): void => $config.setKey('wsServiceUrl', wsServiceUrl);
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
