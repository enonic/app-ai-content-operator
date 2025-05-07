import {executeFunction} from '/lib/xp/task';

const PREFIX = 'ai-operator-task-';

export function runAsyncTask(name: string, callback: FnVoid): void {
    executeFunction({
        description: `${PREFIX}${name}`,
        func: callback,
    });
}
