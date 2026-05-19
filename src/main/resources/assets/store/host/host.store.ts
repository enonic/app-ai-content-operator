import { atom } from 'nanostores';

import type { AiPluginContext } from '@shared/ai-protocol';

// The plugin context CS hands to `mount`. Held here so non-React modules (the
// WebSocket layer, dialog logic) can reach `api` without prop-drilling.
export const $hostContext = atom<AiPluginContext | null>(null);
