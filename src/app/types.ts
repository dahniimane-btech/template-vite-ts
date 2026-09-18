export type Direction = 'es-fr' | 'fr-es';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface Phrase {
    id: string;
    es: string;
    fr: string;
    topic: string;
}

export interface CardState {
    id: string;
    box: number;
    direction: Direction;
    dueDate: string;
    introducedDate: string;
    reviewCount: number;
    lastResult: Grade | null;
    mastered: boolean;
}

export interface Settings {
    newPerDay: number;
    reviewPerDay: number;
}

export interface HistoryEntry {
    date: string;
    studied: number;
}

export interface AppState {
    cards: Record<string, CardState>;
    nextPhraseIndex: number;
    lastGenerationDate: string | null;
    streak: number;
    lastStudyDate: string | null;
    settings: Settings;
    history: HistoryEntry[];
}
