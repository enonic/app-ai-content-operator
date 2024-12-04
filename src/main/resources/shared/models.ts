export const MODELS = ['flash', 'pro'] as const;
export type Model = (typeof MODELS)[number];
