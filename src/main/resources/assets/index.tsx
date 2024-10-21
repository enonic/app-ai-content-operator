import React from 'react';
import {createRoot} from 'react-dom/client';

import {AiEvents, dispatch} from './common/events';
import App from './components/App/App';
import './i18n/config';
import './index.css';
import {$config, setServiceUrl} from './stores/config';

type SetupConfig = {
    serviceUrl: string;
};

export function render(container: HTMLElement): void {
    if ($config.get().serviceUrl === '') {
        console.warn('[Enonic AI] Content Operator was rendered before configured.');
    }

    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );

    dispatch(AiEvents.RENDERED);
}

export function setup({serviceUrl}: SetupConfig): void {
    setServiceUrl(serviceUrl);
}
