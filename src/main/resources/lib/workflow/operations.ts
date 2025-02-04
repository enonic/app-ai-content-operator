import {ERRORS} from '../../shared/errors';
import {GenerateMessage, StopMessage} from '../../shared/messages';
import {logError} from '../logger';
import {analyze} from '../pipeline/analyze';
import {generate} from '../pipeline/generate';
import {sendAnalyzedMessage, sendFailedErrorMessage, sendFailedWarningMessage, sendGeneratedMessage} from './websocket';

const ACTIVE_OPERATIONS = __.newBean<Java.ConcurrentHashMap<string, boolean>>('java.util.concurrent.ConcurrentHashMap');

function isActiveOperation(id: string): boolean {
    return ACTIVE_OPERATIONS.get(id) != null;
}

function addActiveOperation(id: string): boolean {
    if (isActiveOperation(id)) {
        return false;
    }
    ACTIVE_OPERATIONS.put(id, true);
    return isActiveOperation(id);
}

function removeActiveOperation(id: string): void {
    ACTIVE_OPERATIONS.remove(id);
}

//
//* Operations
//

export function analyzeAndGenerate(message: GenerateMessage): void {
    const {metadata} = message;
    const {id} = metadata;

    try {
        if (!addActiveOperation(id)) {
            return sendFailedErrorMessage(
                metadata,
                ERRORS.WS_OPERATION_ALREADY_RUNNING.withMsg(`Generation id: ${id}`),
            );
        }

        const [analysis, err1] = analyze(message.payload);

        if (!isActiveOperation(id)) {
            return;
        }

        if (err1) {
            return sendFailedErrorMessage(metadata, err1);
        }

        if (typeof analysis === 'string') {
            return sendFailedWarningMessage(metadata, analysis);
        }

        sendAnalyzedMessage(metadata, analysis);

        const [generation, err2] = generate({
            prompt: analysis.result,
            history: message.payload.history.generation,
            fields: message.payload.fields,
        });

        if (!isActiveOperation(id)) {
            return;
        }

        if (err2) {
            return sendFailedErrorMessage(metadata, err2);
        }

        sendGeneratedMessage(metadata, generation);

        removeActiveOperation(id);
    } catch (e) {
        sendFailedErrorMessage(metadata, ERRORS.WS_UNKNOWN_ERROR.withMsg('See server logs.'));
        logError(e);
    }
}

export function stopGeneration(message: StopMessage): void {
    const {generationId} = message.payload;
    removeActiveOperation(generationId);
}
