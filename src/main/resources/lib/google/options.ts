import {ERRORS} from '../../shared/errors';
import {Model} from '../../shared/models';
import {GOOGLE_GEMINI_FLASH_URL, GOOGLE_GEMINI_PRO_URL, GOOGLE_SAK_PATH} from '../config';
import {APP_NAME} from '../constants';
import {logDebug, LogDebugGroups, logError} from '../logger';

type ClientOptions = {
    accessToken: string;
} & Record<Model, string>;

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

        const flash = createModelGenerateUrl('flash', projectId);
        const pro = createModelGenerateUrl('pro', projectId);

        return [
            {
                accessToken,
                flash,
                pro,
            },
            null,
        ];
    } catch (error) {
        return [null, ERRORS.GOOGLE_SAK_READ_FAILED.withMsg(String(error))];
    }
}

function createModelGenerateUrl(model: Model, projectId: string): string {
    return `${createModelBaseUrl(model, projectId)}:generateContent`;
}

function createModelBaseUrl(model: Model, projectId: string): string {
    // Regional endpoint with EU data residency (europe-west1). Preview models may not be available.
    // Global endpoint routes to any available region (no data residency guarantee):
    // https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/<model>
    switch (model) {
        case 'flash':
            return (
                GOOGLE_GEMINI_FLASH_URL ||
                `https://europe-west1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/europe-west1/publishers/google/models/gemini-2.5-flash`
            );
        case 'pro':
            return (
                GOOGLE_GEMINI_PRO_URL ||
                `https://europe-west1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/europe-west1/publishers/google/models/gemini-2.5-pro`
            );
    }
}
