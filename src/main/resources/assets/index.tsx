import React from 'react';
import {createRoot} from 'react-dom/client';

import AssistantDialog from './components/dialog/AssistantDialog/AssistantDialog';
import LaunchButton from './components/LaunchButton/LaunchButton';
import './i18n/i18n';
import './index.css';
import {isConfigured, setSharedSocketUrl, setWsServiceUrl} from './stores/config';

type SetupConfig = {
    sharedSocketUrl?: string;
    // Kept for backwards compatibility
    wsServiceUrl?: string;
};

export function render(buttonContainer: HTMLElement, dialogContainer: HTMLElement): void {
    if (!isConfigured()) {
        console.error('[Enonic AI] Content Operator was rendered before configured. Please call `setup` first.');
    }

    buttonContainer.classList.add('ai-content-operator');
    const buttonRoot = createRoot(buttonContainer);
    buttonRoot.render(
        <React.StrictMode>
            <LaunchButton />
        </React.StrictMode>,
    );

    dialogContainer.classList.add('ai-content-operator');
    const dialogRoot = createRoot(dialogContainer);
    dialogRoot.render(
        <React.StrictMode>
            <AssistantDialog />
        </React.StrictMode>,
    );
}

export function setup({sharedSocketUrl, wsServiceUrl}: SetupConfig): void {
    if (sharedSocketUrl) {
        setSharedSocketUrl(sharedSocketUrl);
        return;
    }

    if (wsServiceUrl) {
        console.warn('[Enonic AI] `wsServiceUrl` is deprecated. Use `sharedSocketUrl` instead.');
        setWsServiceUrl(wsServiceUrl);
        return;
    }

    console.error('[Enonic AI] No sharedSocketUrl or wsServiceUrl provided.');
}
