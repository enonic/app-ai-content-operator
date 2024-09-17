import {ERRORS} from '../errors';
import {getOptions} from '../google/options';
import {logDebug, LogDebugGroups} from '../logger';
import {DEFAULT_MODE, Mode} from '../shared/modes';
import {GeminiProxy} from './gemini';
import {isMode, ModelProxy, ModelProxyConfig} from './model';

type ConnectionConfig = Omit<ModelProxyConfig, 'model' | 'mode'> & {
    mode: Optional<Mode>;
};

export function connect({mode, instructions, messages, schema}: ConnectionConfig): Try<ModelProxy> {
    logDebug(
        LogDebugGroups.FUNC,
        `proxy.connect(${mode}, [instructions: ${instructions?.length ?? 0}], [messages: ${messages.length}], ${schema ? '[schema]' : undefined})`,
    );

    const preferredMode = mode || DEFAULT_MODE;
    if (!isMode(preferredMode)) {
        return [null, ERRORS.FUNC_UNKNOWN_MODE];
    }

    const [options, err] = getOptions();
    if (err) {
        return [null, err];
    }
    const {model} = options;

    const config = {model, mode: preferredMode, instructions, messages, schema};
    return [new GeminiProxy(config), null];
}
