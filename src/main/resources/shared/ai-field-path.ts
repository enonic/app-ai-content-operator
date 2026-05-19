import type { AiFieldPath } from './ai-protocol';

// Converts the operator's internal path string (produced by `pathToString`,
// e.g. `/items/item[2]/title` or the `/__topic__` sentinel) to the protocol
// `AiFieldPath` for the CS seam. The operator only ever produces `topic` and
// `data` kinds.
export function pathStringToAiFieldPath(path: string): AiFieldPath {
  const normalized = path.startsWith('/') ? path.slice(1) : path;

  if (normalized === '__topic__') {
    return { kind: 'topic' };
  }

  return { kind: 'data', field: normalized.split('/').join('.') };
}
