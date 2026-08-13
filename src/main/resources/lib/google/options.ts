import type { Model } from '../../shared/models';
import type { ThinkingLevel } from './types';

import { ERRORS } from '../../shared/errors';
import {
  GOOGLE_GEMINI_FLASH_URL,
  GOOGLE_GEMINI_PRO_URL,
  GOOGLE_PROJECT_ID,
  GOOGLE_SAK_PATH,
} from '../config';
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
    modelName: 'gemini-3.7-flash',
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

  try {
    const handler = __.newBean(`${APP_NAME}.google.ServiceAccountKeyHandler`);

    const accessToken = handler.getAccessToken(GOOGLE_SAK_PATH);
    if (!accessToken) {
      return [null, ERRORS.GOOGLE_ACCESS_TOKEN_MISSING];
    }

    const resolveProjectId = createProjectIdResolver(handler);

    const [flash, flashErr] = createModelConfig('flash', resolveProjectId);
    if (flashErr) {
      return [null, flashErr];
    }

    const [pro, proErr] = createModelConfig('pro', resolveProjectId);
    if (proErr) {
      return [null, proErr];
    }

    return [{ accessToken, flash, pro }, null];
  } catch (error) {
    // ? Names the credential source rather than the failed step, since any step in the try can throw
    const failure =
      GOOGLE_SAK_PATH != null ? ERRORS.GOOGLE_CREDENTIALS_FILE_FAILED : ERRORS.GOOGLE_ADC_FAILED;
    return [null, failure.withMsg(String(error))];
  }
}

// ? Resolved lazily and memoized: a project id is only needed for models without a URL override
function createProjectIdResolver(handler: ServiceAccountKeyHandler): () => Optional<string> {
  let projectId: Optional<string>;

  return () => {
    projectId ??= GOOGLE_PROJECT_ID ?? handler.getProjectId(GOOGLE_SAK_PATH);
    return projectId;
  };
}

function createModelConfig(
  model: Model,
  resolveProjectId: () => Optional<string>,
): Try<ModelConfig> {
  const { modelName, thinkingLevel, urlOverride } = MODEL_DEFAULTS[model];

  if (urlOverride != null) {
    return [{ url: createGenerateUrl(urlOverride), thinkingLevel }, null];
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    return [null, ERRORS.GOOGLE_PROJECT_ID_MISSING];
  }

  return [{ url: createGenerateUrl(buildModelUrl(modelName, projectId)), thinkingLevel }, null];
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
