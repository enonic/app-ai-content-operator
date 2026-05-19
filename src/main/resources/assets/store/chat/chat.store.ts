import { atom, computed, map } from 'nanostores';

import { flattenGraph } from '@/common/graph';

import type { ChatMessage } from '@/store/content';

export const $startId = atom<Optional<string>>(undefined);

export const $messages = map<Record<string, ChatMessage>>({});

export const $history = computed([$startId, $messages], (startId, messages): ChatMessage[] => {
  return startId != null ? flattenGraph(messages, startId) : [];
});

export const $lastMessage = computed($history, (history): Optional<ChatMessage> => history.at(-1));
