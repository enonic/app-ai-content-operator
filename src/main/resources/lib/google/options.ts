import {ERRORS} from '../../shared/errors';
import {Model} from '../../shared/models';
import {GOOGLE_GEMINI_FLASH_URL, GOOGLE_GEMINI_PRO_URL, GOOGLE_SAK_PATH} from '../config';
import {APP_NAME} from '../constants';
import {logDebug, LogDebugGroups, logError} from '../logger';

export type ModelOptions = {
    key: Model;
    name: string;
    url: string;
};

type ClientOptions = {
    accessToken: string;
} & Record<Model, ModelOptions>;

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

    if (!GOOGLE_GEMINI_FLASH_URL) {
        return [null, ERRORS.GOOGLE_GEMINI_URL_MISSING.withMsg('(Flash type)')];
    }
    if (!GOOGLE_GEMINI_PRO_URL) {
        return [null, ERRORS.GOOGLE_GEMINI_URL_MISSING.withMsg('(Pro type)')];
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

        const [flash, flashValidationError] = validateUrl(GOOGLE_GEMINI_FLASH_URL, projectId, 'flash');
        if (flashValidationError) {
            return [null, flashValidationError];
        }

        const [pro, proValidationError] = validateUrl(GOOGLE_GEMINI_PRO_URL, projectId, 'pro');
        if (proValidationError) {
            return [null, proValidationError];
        }

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

function validateUrl(url: string, projectId: string, key: Model): Try<ModelOptions> {
    const urlRegex = /projects\/([^/]+)\/locations\/[^/]+\/publishers\/google\/models\/([^/]+)/;
    const match = url.match(urlRegex);

    if (!match) {
        return [null, ERRORS.GOOGLE_GEMINI_URL_INVALID.withMsg(url)];
    }

    const [, urlProjectId, name] = match;
    if (projectId !== urlProjectId) {
        return [null, ERRORS.GOOGLE_PROJECT_ID_MISMATCH.withMsg(`${projectId} !== ${urlProjectId}`)];
    }

    if (!name || !name.startsWith('gemini')) {
        return [null, ERRORS.GOOGLE_MODEL_NOT_SUPPORTED.withMsg(`Model "${name}" must be from Gemini family.`)];
    }

    return [
        {
            key,
            name,
            url: `${url}:generateContent`,
        },
        null,
    ];
}
