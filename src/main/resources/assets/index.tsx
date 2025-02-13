import React from 'react';
import {createRoot} from 'react-dom/client';

import AssistantDialog from './components/dialog/AssistantDialog/AssistantDialog';
import LaunchButton from './components/LaunchButton/LaunchButton';
import './i18n/i18n';
import './index.css';
import {$config, setSharedSocketUrl} from './stores/config';

type SetupConfig = {
    sharedSocketUrl: string;
};

export function render(buttonContainer: HTMLElement, dialogContainer: HTMLElement): void {
    if ($config.get().sharedSocketUrl === '') {
        console.warn('[Enonic AI] Content Operator was rendered before configured.');
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

export function setup({sharedSocketUrl}: SetupConfig): void {
    setSharedSocketUrl(sharedSocketUrl);
}
