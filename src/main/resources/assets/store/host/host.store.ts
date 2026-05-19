import { atom } from 'nanostores';

import type { AiPluginApi, AiPluginContext } from '@shared/ai-protocol';

// The plugin context CS hands to `mount`. Held here so non-React modules (the
// WebSocket layer, dialog logic) can reach `api` without prop-drilling.
const $context = atom<AiPluginContext | null>(null);

export function setPluginContext(context: AiPluginContext): void {
  $context.set(context);
}

export function clearPluginContext(): void {
  $context.set(null);
}

// Throws if called before `mount` ran — that is a programming error, not a
// runtime condition to handle.
export function getHostApi(): AiPluginApi {
  const context = $context.get();
  if (context == null) {
    throw new Error('[ai.contentOperator] host API requested before mount');
  }
  return context.api;
}

export function getInitialContext(): AiPluginContext | null {
  return $context.get();
}
