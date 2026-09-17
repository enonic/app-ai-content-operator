// ai-protocol.ts — the CS <-> AI-plugin contract. Pure types, zero dependencies.
//
// Source of truth: app-contentstudio (v6/shared/ai/ai-protocol.ts).
// Mirror copies in app-ai-translator and app-ai-content-operator must stay
// in sync (each repo applies its own formatting). Do not edit a mirror copy.

export const AI_PROTOCOL_VERSION = 3;

// ---- Identity ---------------------------------------------------------------

export type AiPluginId = 'ai.translator' | 'ai.contentOperator';

// ---- Field addressing -------------------------------------------------------

export type AiFieldPath =
  | { kind: 'topic' }
  | { kind: 'data'; field: string }
  | { kind: 'mixin'; mixin: string; field: string }
  | { kind: 'pageConfig'; field: string }
  | { kind: 'componentText'; component: string }
  | { kind: 'componentConfig'; component: string; field: string };

// ---- Field state ------------------------------------------------------------

export type AiFieldState = 'idle' | 'processing' | 'completed' | 'failed';

export type AiFieldStateDetail = {
  text?: string;
  message?: string;
};

export type AiAnimation = 'glow' | 'innerGlow' | 'scroll';

export type AiColor = 'green' | 'amber';

// ---- State snapshots --------------------------------------------------------

export type AiContentSnapshot = {
  contentId: string;
  contentPath: string;
  project: string;
  topic: string;
  fields: unknown;
  mixins?: { name: string; fields: unknown }[];
  page?: unknown;
};

export type AiSchemaSnapshot = {
  name: string;
  form: unknown;
  mixins?: { name: string; form: unknown }[];
  page?: unknown;
};

export type AiLanguageSnapshot = {
  tag: string;
  name: string;
};

export type AiState = {
  content: AiContentSnapshot | null;
  schema: AiSchemaSnapshot | null;
  language: AiLanguageSnapshot | null;
};

// ---- Configuration ----------------------------------------------------------

export type AiPluginConfig = {
  wsServiceUrl: string;
  licenseServiceUrl?: string;
  sharedSocketUrl?: string;
  instructions: string;
  user?: AiUser;
};

export type AiUser = {
  key: string;
  displayName: string;
};

// ---- Signals (universal, CS -> plugin) --------------------------------------

export type AiSignals = {
  'content:change': AiContentSnapshot;
  'schema:change': AiSchemaSnapshot;
  'language:change': AiLanguageSnapshot;
  'config:change': AiPluginConfig;
};

// ---- Commands (declared, CS -> plugin) --------------------------------------

export type AiCommands = {
  'dialog:open': void;
  'dialog:close': void;
  'context:set': string | null;
  'image:uploaded': { contentId: string; project: string };
  // Headless generation (voice): produce values for the given fields and
  // apply them without opening the dialog; answer with reportResult.
  'generate:fields': AiFieldsRequest;
  // Headless translation (voice): translate the persisted content into the
  // language, apply the given fields (all translatable fields when omitted)
  // without opening the dialog; answer with reportResult.
  'translate:fields': AiTranslateRequest;
};

// ---- Field requests and results (headless commands) -------------------------

export type AiFieldsRequest = {
  requestId: string;
  paths: AiFieldPath[];
  instructions?: string;
};

export type AiTranslateRequest = {
  requestId: string;
  language: AiLanguageSnapshot;
  paths?: AiFieldPath[];
};

export type AiFieldsResult = {
  requestId: string;
  applied: AiFieldPath[];
  failed: { path?: AiFieldPath; message: string }[];
};

// ---- Host API (plugin -> CS) ------------------------------------------------

export type AiNotifyLevel = 'info' | 'warn' | 'error';

export type AiPluginApi = {
  on<E extends keyof AiSignals>(event: E, handler: (payload: AiSignals[E]) => void): () => void;
  on<E extends keyof AiCommands>(event: E, handler: (payload: AiCommands[E]) => void): () => void;

  applyValue(path: AiFieldPath, text: string): boolean;
  setFieldState(path: AiFieldPath, state: AiFieldState, detail?: AiFieldStateDetail): void;
  animateField(path: AiFieldPath, kinds: AiAnimation[], color?: AiColor): void;
  setContext(context: string | null): void;
  setDialogState(open: boolean): void;
  requestSave(): void;
  notify(level: AiNotifyLevel, message: string): void;
  // Completes a headless field command (see AiCommands).
  reportResult(result: AiFieldsResult): void;
};

// ---- Plugin manifest and lifecycle ------------------------------------------

export type AiPluginContext = {
  config: AiPluginConfig;
  initial: AiState;
  api: AiPluginApi;
};

export type AiPluginInstance = {
  dispose(): void;
};

export type AiPlugin = {
  id: AiPluginId;
  version: string;
  commands?: readonly (keyof AiCommands)[];
  mount(
    container: HTMLElement,
    context: AiPluginContext,
  ): AiPluginInstance | Promise<AiPluginInstance>;
};

// ---- Host -------------------------------------------------------------------

export type AiHost = {
  register(plugin: AiPlugin): void;
  unregister(id: AiPluginId): void;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // `_pending` holds plugins that registered against the main.html
    // bootstrap stub before initAiHost() wired the real host.
    Enonic?: { AI?: AiHost & { _pending?: AiPlugin[] } };
  }
}
