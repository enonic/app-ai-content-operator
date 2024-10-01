export const MODELS = ['flash', 'pro'] as const;
export type Model = (typeof MODELS)[number];

export const DEFAULT_MODEL: Model = 'pro';

export function isModel(model: unknown): model is Model {
    return model != null && typeof model === 'string' && MODELS.indexOf(model as Model) >= 0;
}
