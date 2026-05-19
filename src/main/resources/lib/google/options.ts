import type { Model } from '../../shared/models';
import type { ThinkingLevel } from './types';

import { ERRORS } from '../../shared/errors';
import { GOOGLE_GEMINI_FLASH_URL, GOOGLE_GEMINI_PRO_URL, GOOGLE_SAK_PATH } from '../config';
import { APP_NAME } from '../constants';
import { logDebug, LogDebugGroups, logError } from '../logger';

export type ModelConfig = {
  url: string;
  thinkingLevel: ThinkingLevel;
};

export type ClientOptions = {
  accessToken: string;
} & Record<Model, ModelConfig>;

type ModelDefaults = {
  modelName: string;
  thinkingLevel: ThinkingLevel;
  urlOverride: string | null;
};

// Pro favours precise, intent-aware output (more thinking); flash favours faster, lighter analysis.
const MODEL_DEFAULTS: Record<Model, ModelDefaults> = {
  flash: {
    modelName: 'gemini-3.1-flash-lite',
    thinkingLevel: 'minimal',
    urlOverride: GOOGLE_GEMINI_FLASH_URL,
  },
  pro: {
    modelName: 'gemini-3.5-flash',
    thinkingLevel: 'low',
    urlOverride: GOOGLE_GEMINI_PRO_URL,
  },
};

export function getOptions(): Try<ClientOptions> {
  const [options, err] = parseOptions();
  if (err) {
    logError(err);
    return [null, err];
  }
  return [options, null];
}

export function getModelConfig(model: Model): Try<ModelConfig> {
  const [options, err] = getOptions();
  if (err) return [null, err];
  return [options[model], null];
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
  const { modelName, thinkingLevel, urlOverride } = MODEL_DEFAULTS[model];
  return {
    url: createGenerateUrl(urlOverride ?? buildModelUrl(modelName, projectId)),
    thinkingLevel,
  };
}

function createGenerateUrl(baseUrl: string): string {
  return `${baseUrl}:generateContent`;
}

// EU multi-region endpoint: keeps data inside the EU while pooling capacity across EU data centres.
// Single-region alternative: europe-west1-aiplatform.googleapis.com with locations/europe-west1.
// Global (no data residency): aiplatform.googleapis.com with locations/global.
function buildModelUrl(modelName: string, projectId: string): string {
  return `https://aiplatform.eu.rep.googleapis.com/v1/projects/${projectId}/locations/eu/publishers/google/models/${modelName}`;
}
