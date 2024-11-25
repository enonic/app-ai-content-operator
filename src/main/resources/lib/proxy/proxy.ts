import {parseOptions} from '../google/options';
import {logDebug, LogDebugGroups} from '../logger';
import {GeminiProxy} from './gemini';
import {ModelProxy, ModelProxyConfig} from './model';

type ConnectionConfig = Omit<ModelProxyConfig, 'models'>;

export function connect({instructions, messages}: ConnectionConfig): Try<ModelProxy> {
    logDebug(
        LogDebugGroups.FUNC,
        `proxy.connect([instructions: ${instructions?.length ?? 0}], [messages: ${messages.length}]})`,
    );

    const [options, err] = parseOptions();
    if (err) {
        return [null, err];
    }

    const models = {
        flash: options.flash,
        pro: options.pro,
    };

    const config = {models, instructions, messages};
    return [new GeminiProxy(config), null];
}
