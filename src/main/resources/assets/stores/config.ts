import {map} from 'nanostores';

import {addGlobalConfigHandler} from '../common/events';
import {ConfigData} from './data/ConfigData';

export type Config = {
    serviceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    locales: string[];
};

export const $config = map<Config>({
    serviceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    locales: ['en'],
});

export const setServiceUrl = (serviceUrl: string): void => $config.setKey('serviceUrl', serviceUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setLocales = (locales: string[]): void => $config.setKey('locales', locales.slice());

addGlobalConfigHandler((event: CustomEvent<ConfigData>) => {
    console.log('Config:', event.detail.payload);
    setUser(event.detail.payload.user);
});
