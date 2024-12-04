import * as authLib from '/lib/xp/auth';

import {generate} from '../../lib/flow/legacy';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {respondData, respondError} from '../../lib/requests';
import {ERRORS} from '../../shared/errors';
import {isModelRequestData, ModelPostResponse, ModelRequestData} from '../../shared/model';

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

        const result = generate(data);

        return respondData(result);
    } catch (err2) {
        logError(err2);
        return respondError(ERRORS.REST_UNHANDLED_ERROR.withMsg(String(err2)));
    }
}

function parsePostRequest(request: Enonic.Request): Try<ModelRequestData> {
    try {
        if (!request.body) {
            return [null, ERRORS.REST_REQUEST_BODY_MISSING];
        }

        const body: unknown = JSON.parse(request.body);

        if (!isModelRequestData(body)) {
            return [null, ERRORS.REST_REQUEST_BODY_INVALID];
        }

        return [body, null];
    } catch (err) {
        return [null, ERRORS.REST_REQUEST_BODY_INVALID];
    }
}
