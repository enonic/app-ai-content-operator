import * as authLib from '/lib/xp/auth';

import {ERRORS} from '../../lib/errors';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {ModelProxy, validateMode} from '../../lib/proxy/model';
import {connect} from '../../lib/proxy/proxy';
import {respondData, respondError} from '../../lib/requests';
import type {ModelPostResponse, ModelRequestData} from '../../types/shared/model';

export function post(request: Enonic.Request): Enonic.Response<ModelPostResponse> {
    logDebug(LogDebugGroups.REST, 'post()');

    const isAuthenticated = authLib.getUser() != null;
    if (!isAuthenticated) {
        return respondError(ERRORS.REST_NOT_AUTHENTICATED, 401);
    }

    try {
        const [data, err1] = parsePostRequest(request);
        if (err1) {
            return respondError(err1);
        }

        const [model, err2] = connectModel(data);
        if (err2) {
            return respondError(err2);
        }

        return respondData(model.generate());
    } catch (err3) {
        logError(err3);
        return respondError(ERRORS.REST_UNHANDLED_ERROR.withMsg(String(err3)));
    }
}

function connectModel(data: ModelRequestData): Try<ModelProxy> {
    const mode = validateMode(data.mode);
    const {instructions, messages, schema} = data;
    return connect({mode, instructions, messages, schema});
}

function parsePostRequest(request: Enonic.Request): Try<ModelRequestData> {
    if (!request.body) {
        return [null, ERRORS.REST_REQUEST_BODY_MISSING];
    }

    const body = JSON.parse(request.body) as ModelRequestData;

    switch (body.operation) {
        case 'generate':
            if (body.mode == null) {
                return [null, ERRORS.REST_MODE_REQUIRED];
            }
            if (body.messages == null) {
                return [null, ERRORS.REST_MESSAGES_REQUIRED];
            }
            return [body, null];
        default:
            return [null, ERRORS.REST_OPERATION_NOT_SUPPORTED];
    }
}
