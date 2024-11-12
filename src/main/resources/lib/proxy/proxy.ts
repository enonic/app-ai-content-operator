import {ERRORS} from '../errors';
import {parseOptions} from '../google/options';
import {logDebug, LogDebugGroups} from '../logger';
import {DEFAULT_MODEL, isModel, Model} from '../shared/models';
import {DEFAULT_MODE, isMode, Mode} from '../shared/modes';
import {GeminiProxy} from './gemini';
import {ModelProxy, ModelProxyConfig} from './model';

type ConnectionConfig = Omit<ModelProxyConfig, 'modelName' | 'mode' | 'url'> & {
    model: Optional<Model>;
    mode: Optional<Mode>;
};

export function connect({model, mode, instructions, messages, schema}: ConnectionConfig): Try<ModelProxy> {
    logDebug(
        LogDebugGroups.FUNC,
        `proxy.connect(${mode}, [instructions: ${instructions?.length ?? 0}], [messages: ${messages.length}], ${schema ? '[schema]' : undefined})`,
    );

    const preferredModel = model || DEFAULT_MODEL;
    if (!isModel(preferredModel)) {
        return [null, ERRORS.FUNC_UNKNOWN_MODEL];
    }

    const preferredMode = mode || DEFAULT_MODE;
    if (!isMode(preferredMode)) {
        return [null, ERRORS.FUNC_UNKNOWN_MODE];
    }

    const [options, err] = parseOptions();
    if (err) {
        return [null, err];
    }
    const {url, name} = options[preferredModel];

    const config = {modelName: name, mode: preferredMode, url, instructions, messages, schema};
    return [new GeminiProxy(config), null];
}
