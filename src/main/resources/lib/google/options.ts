import { ERRORS } from '../../shared/errors';
import type { Model } from '../../shared/models';
import { GOOGLE_GEMINI_FLASH_URL, GOOGLE_GEMINI_PRO_URL, GOOGLE_SAK_PATH } from '../config';
import { APP_NAME } from '../constants';
import { logDebug, LogDebugGroups, logError } from '../logger';
import type { ThinkingLevel } from './types';

type ModelConfig = {
  url: string;
  thinkingLevel: ThinkingLevel;
};

type ClientOptions = {
  accessToken: string;
} & Record<Model, ModelConfig>;

// Pro favours precise, intent-aware output (more thinking); flash favours faster, lighter analysis.
const THINKING_LEVELS: Record<Model, ThinkingLevel> = {
  flash: 'low',
  pro: 'medium',
};

export function getOptions(): Try<ClientOptions> {
  const [options, err] = parseOptions();
  if (err) {
    logError(err);
    return [null, err];
  }
  return [options, null];
}

export function parseOptions(): Try<ClientOptions> {
  logDebug(LogDebugGroups.GOOGLE, 'options.getOptions()');

  if (!GOOGLE_SAK_PATH) {
    return [null, ERRORS.GOOGLE_SAK_MISSING];
  }

  try {
    const handler = __.newBean(`${APP_NAME}.google.ServiceAccountKeyHandler`);

    const accessToken = handler.getAccessToken(GOOGLE_SAK_PATH);
    if (!accessToken) {
      return [null, ERRORS.GOOGLE_ACCESS_TOKEN_MISSING];
    }

    const projectId = handler.getProjectId(GOOGLE_SAK_PATH);
    if (!projectId) {
      return [null, ERRORS.GOOGLE_PROJECT_ID_MISSING];
    }

    return [
      {
        accessToken,
        flash: createModelConfig('flash', projectId),
        pro: createModelConfig('pro', projectId),
      },
      null,
    ];
  } catch (error) {
    return [null, ERRORS.GOOGLE_SAK_READ_FAILED.withMsg(String(error))];
  }
}

function createModelConfig(model: Model, projectId: string): ModelConfig {
  return {
    url: createModelGenerateUrl(model, projectId),
    thinkingLevel: THINKING_LEVELS[model],
  };
}

function createModelGenerateUrl(model: Model, projectId: string): string {
  return `${createModelBaseUrl(model, projectId)}:generateContent`;
}

function createModelBaseUrl(model: Model, projectId: string): string {
  // EU multi-region endpoint: keeps data inside the EU while pooling capacity across EU data
  // centres. Required for models not yet available on single-region hosts (e.g. gemini-3.1-flash-lite).
  // Single-region alternative: europe-west1-aiplatform.googleapis.com with locations/europe-west1.
  // Global (no data residency): aiplatform.googleapis.com with locations/global.
  const defaultUrl = `https://aiplatform.eu.rep.googleapis.com/v1/projects/${projectId}/locations/eu/publishers/google/models/gemini-3.1-flash-lite`;
  switch (model) {
    case 'flash':
      return GOOGLE_GEMINI_FLASH_URL || defaultUrl;
    case 'pro':
      return GOOGLE_GEMINI_PRO_URL || defaultUrl;
  }
}
