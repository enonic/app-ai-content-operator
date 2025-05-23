export const MODES = ['precise', 'focused', 'balanced', 'creative'] as const;
export type Mode = (typeof MODES)[number];

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
            topP: 1.0,
        },
    },
    focused: {
        gemini: {
            temperature: 0.3,
            topP: 0.95,
        },
    },
    balanced: {
        gemini: {
            temperature: 0.6,
            topP: 0.95,
        },
    },
    creative: {
        gemini: {
            temperature: 0.8,
            topP: 0.98,
        },
    },
};

export type ModelMeta = {
    model: string;
    mode: Mode;
};

export function isMode(mode: unknown): mode is Mode {
    return mode != null && typeof mode === 'string' && MODES.indexOf(mode as Mode) >= 0;
}
