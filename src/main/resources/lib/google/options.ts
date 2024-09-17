import {GOOGLE_GEMINI_URL, GOOGLE_SAK_PATH} from '../config';
import {APP_NAME} from '../constants';
import {ERRORS} from '../errors';
import {logDebug, LogDebugGroups} from '../logger';

type ClientOptions = {
    accessToken: string;
    model: string;
    url: string;
};

export function getOptions(): Try<ClientOptions> {
    logDebug(LogDebugGroups.GOOGLE, 'options.getOptions()');

    if (!GOOGLE_GEMINI_URL) {
        return [null, ERRORS.GOOGLE_GEMINI_URL_MISSING];
    }

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

        const [model, validationError] = validateUrl(GOOGLE_GEMINI_URL, projectId);
        if (validationError) {
            return [null, validationError];
        }

        const url = `${GOOGLE_GEMINI_URL}:generateContent`;

        return [
            {
                accessToken,
                model,
                url,
            },
            null,
        ];
    } catch (error) {
        return [null, ERRORS.GOOGLE_SAK_READ_FAILED.withMsg(String(error))];
    }
}

function validateUrl(url: string, projectId: string): Try<string> {
    const urlRegex = /projects\/([^/]+)\/locations\/[^/]+\/publishers\/google\/models\/([^/]+)/;
    const match = url.match(urlRegex);

    if (!match) {
        return [null, ERRORS.GOOGLE_GEMINI_URL_INVALID.withMsg(url)];
    }

    const [, urlProjectId, model] = match;
    if (projectId !== urlProjectId) {
        return [null, ERRORS.GOOGLE_PROJECT_ID_MISMATCH.withMsg(`${projectId} !== ${urlProjectId}`)];
    }

    if (!model || !model.startsWith('gemini')) {
        return [null, ERRORS.GOOGLE_MODEL_NOT_SUPPORTED.withMsg(`Model "${model}" must be from Gemini family.`)];
    }

    return [model, null];
}
