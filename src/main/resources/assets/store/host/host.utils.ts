import { pathStringToAiFieldPath } from '@shared/ai-field-path';
import { SPECIAL_NAMES } from '@shared/enums';

import { setConfig } from '@/store/config';
import { setLanguage, setPersistedData, setSchema } from '@/store/content';

import type { ApplyMessage, ContentData, Schema } from '@/store/content';
import type {
  AiContentSnapshot,
  AiLanguageSnapshot,
  AiPluginApi,
  AiPluginConfig,
  AiPluginContext,
  AiSchemaSnapshot,
} from '@shared/ai-protocol';

import { $hostContext } from './host.store';

export function setPluginContext(context: AiPluginContext): void {
  $hostContext.set(context);
}

export function clearPluginContext(): void {
  $hostContext.set(null);
}

// Throws if called before `mount` ran — that is a programming error, not a
// runtime condition to handle.
export function getHostApi(): AiPluginApi {
  const context = $hostContext.get();
  if (context == null) {
    throw new Error('[ai.contentOperator] host API requested before mount');
  }
  return context.api;
}

export function getInitialContext(): AiPluginContext | null {
  return $hostContext.get();
}

// Thin adapters: take a protocol snapshot/config and call the matching store
// setter. They receive the typed payload directly — no CustomEvent unwrapping.

export const applyConfig = (config: AiPluginConfig): void => setConfig(config);

// ? `fields` is `unknown` by protocol; the operator owns its concrete shape (PropertyArray[]).
export const applyContent = (snapshot: AiContentSnapshot): void =>
  setPersistedData(snapshot as unknown as ContentData);

// ? `form` is `unknown` by protocol; the operator owns its concrete shape (Schema['form']).
export const applySchema = (snapshot: AiSchemaSnapshot): void =>
  setSchema(snapshot as unknown as Schema);

export const applyLanguage = (snapshot: AiLanguageSnapshot): void => setLanguage(snapshot);

// Routes generated results to CS through the typed host API. `__common__` is an
// operator-internal chat-only answer (not a real content field) and must never
// be sent to CS as an `AiFieldPath`, so it is filtered out here.
export function applyResults(items: ApplyMessage[]): void {
  const api = getHostApi();

  for (const item of items) {
    if (item.path === SPECIAL_NAMES.common) {
      continue;
    }

    const fieldPath = pathStringToAiFieldPath(item.path);
    const glow = fieldPath.kind === 'topic' ? 'innerGlow' : 'glow';

    api.applyValue(fieldPath, item.text);
    api.animateField(fieldPath, [glow], 'green');
  }
}

// Scrolls CS to the field referenced by the operator's internal path string and
// highlights it. Matches the legacy interaction behavior (no color argument).
export function scrollToField(path: string): void {
  const fieldPath = pathStringToAiFieldPath(path);
  const glow = fieldPath.kind === 'topic' ? 'innerGlow' : 'glow';

  getHostApi().animateField(fieldPath, ['scroll', glow]);
}
