import {SPECIAL_NAMES} from '../../shared/enums';
import {Mention} from '../stores/data/Mention';

export const MENTION_ALL = {
    path: SPECIAL_NAMES.all,
    prettified: 'Refer all available input fields',
    label: 'All Inputs',
} as const satisfies Mention;

const startsWith = (str: string, search: string): boolean => str.toLowerCase().startsWith(search.toLowerCase());
const includes = (str: string, search: string): boolean => str.toLowerCase().includes(search.toLowerCase());

const mentionsPriority: Record<string, number> = {
    [MENTION_ALL.path]: 1,
    [`/${SPECIAL_NAMES.topic}`]: 2,
};

const compare = (mA: Mention, mB: Mention): number => {
    const priorityA = mentionsPriority[mA.path] ?? 3;
    const priorityB = mentionsPriority[mB.path] ?? 3;

    if (priorityA !== priorityB) {
        return priorityA - priorityB;
    }

    return 0;
};

export function findLooseMatch(list: Mention[], search: string, size = Infinity): Mention[] {
    if (!search) {
        return [...list].sort(compare).slice(0, size);
    }

    const listWithoutAllMacro = list.filter(v => v.path !== MENTION_ALL.path);

    const exactlyMatched = listWithoutAllMacro.filter(v => startsWith(v.label, search)).sort(compare);
    if (exactlyMatched.length >= size) {
        return exactlyMatched.slice(0, size);
    }

    const unmatched = listWithoutAllMacro.filter(v => !startsWith(v.label, search));
    const looselyMatched = unmatched.filter(v => includes(v.label, search)).sort(compare);

    return [...exactlyMatched, ...looselyMatched].slice(0, size);
}
