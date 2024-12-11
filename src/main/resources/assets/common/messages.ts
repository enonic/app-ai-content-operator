import {ModelChatMessageContent} from '../stores/data/ChatMessage';
import {MessageItems} from '../stores/data/MessageItems';
import {MultipleValues} from '../stores/data/MultipleContentValue';

export function pickValue(value: string | MultipleValues): string {
    return typeof value === 'string' ? value : value.values[value.selectedIndex];
}

export function combineValues(value: string | MultipleValues): string {
    return typeof value === 'string' ? value : value.values.join('\n');
}

export function messageContentToValues({
    analysisResult,
    generationResult,
    selectedIndices,
}: ModelChatMessageContent): MessageItems {
    if (!generationResult) {
        return Object.fromEntries(
            Object.entries(analysisResult)
                .filter(([, value]) => 'task' in value)
                .map(([key]) => [key, null]),
        );
    }

    return Object.fromEntries(
        Object.entries(generationResult).map(([key, value]): [string, string | MultipleValues] => {
            if (typeof value === 'string') {
                return [key, value];
            }
            const selectedIndex = selectedIndices?.[key] ?? 0;
            return [key, {values: value, selectedIndex} satisfies MultipleValues];
        }),
    );
}
