export type Direction = 'es-fr' | 'fr-es';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface Phrase {
    id: string;
    es: string;
    fr: string;
    topic: string;
    alternatives?: string[];
}

export interface CardState {
    id: string;
    box: number;
    direction: Direction;
    dueDate: string;
    introducedDate: string;
    reviewCount: number;
    lastResult: Grade | null;
    /** Dernier jour où la carte a été notée (absent sur les états anciens). */
    lastReviewedDate?: string | null;
    mastered: boolean;
}

export interface Settings {
    newPerDay: number;
    reviewPerDay: number;
    writingPerDay: number;
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
    /** Décalage de la liste d'entraînement écrit (absent sur les états anciens). */
    writingRotation?: number;
}
