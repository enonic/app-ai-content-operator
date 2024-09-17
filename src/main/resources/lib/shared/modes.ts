export const MODES = ['precise', 'focused', 'balanced', 'creative'] as const;
export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = 'balanced';

export type ModelParameters = {
    temperature: number;
    topP: number;
};

export type ModeData = {
    gemini: ModelParameters; // temperature: 0.0 - 1.0, top_p: 0.0 - 1.0
};

export const MODES_DATA: Record<Mode, ModeData> = {
    precise: {
        gemini: {
            temperature: 0.2,
            topP: 0.1,
        },
    },
    focused: {
        gemini: {
            temperature: 0.3,
            topP: 0.5,
        },
    },
    balanced: {
        gemini: {
            temperature: 0.5,
            topP: 0.9,
        },
    },
    creative: {
        gemini: {
            temperature: 0.8,
            topP: 0.95,
        },
    },
};

export type ModelMeta = {
    model: string;
    mode: Mode;
};
