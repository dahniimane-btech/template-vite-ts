import type { AppState } from './types';

const STORAGE_KEY = 'esapp_v1';

export const DEFAULT_SETTINGS = {
    newPerDay: 20,
    reviewPerDay: 10,
    writingPerDay: 20,
};

function defaultState(): AppState {
    return {
        cards: {},
        nextPhraseIndex: 0,
        lastGenerationDate: null,
        streak: 0,
        lastStudyDate: null,
        settings: { ...DEFAULT_SETTINGS },
        history: [],
    };
}

export function loadState(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        const parsed = JSON.parse(raw) as Partial<AppState>;
        return {
            ...defaultState(),
            ...parsed,
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        };
    } catch {
        return defaultState();
    }
}

export function saveState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
