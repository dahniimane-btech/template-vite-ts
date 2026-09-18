import type { AppState, CardState, Grade, Phrase } from './types';
import { PHRASES } from './phrases';
import { addDays, todayISO } from './date';

// Intervalles (en jours) associés à chaque "boîte" façon Leitner.
const BOX_INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60];

// Boîte à partir de laquelle une carte est considérée "maîtrisée" en
// reconnaissance (ES -> FR) et bascule en mode production (FR -> ES).
export const MASTERY_BOX = 4;

function clampBox(box: number): number {
    return Math.max(0, Math.min(box, BOX_INTERVALS.length - 1));
}

/**
 * Fait avancer une carte selon la note donnée par l'utilisateur et calcule
 * sa prochaine date de révision.
 */
export function scheduleCard(card: CardState, grade: Grade, today: string): CardState {
    let box = card.box;
    let direction = card.direction;

    if (grade === 'again') {
        // Si l'utilisateur échoue en mode production (FR -> ES), on revient
        // en mode reconnaissance (ES -> FR) pour consolider avant de retenter.
        if (direction === 'fr-es') {
            direction = 'es-fr';
            box = clampBox(box - 2);
        } else {
            box = 0;
        }
    } else if (grade === 'hard') {
        box = clampBox(box - 1);
    } else if (grade === 'good') {
        box = clampBox(box + 1);
    } else {
        box = clampBox(box + 2);
    }

    const mastered = box >= MASTERY_BOX;
    if (mastered && direction === 'es-fr') {
        direction = 'fr-es';
    }

    const interval = grade === 'again' ? 0 : BOX_INTERVALS[box];
    const dueDate = addDays(today, Math.max(interval, grade === 'again' ? 0 : 1));

    return {
        ...card,
        box,
        direction,
        dueDate,
        reviewCount: card.reviewCount + 1,
        lastResult: grade,
        mastered,
    };
}

function newCard(phraseId: string, today: string): CardState {
    return {
        id: phraseId,
        box: 0,
        direction: 'es-fr',
        dueDate: today,
        introducedDate: today,
        reviewCount: 0,
        lastResult: null,
        mastered: false,
    };
}

/**
 * S'assure que les nouvelles cartes du jour ont été générées (une seule fois
 * par jour). Ajoute jusqu'à `settings.newPerDay` phrases jamais vues.
 */
export function ensureDailyGeneration(state: AppState, today: string = todayISO()): AppState {
    if (state.lastGenerationDate === today) {
        return state;
    }

    const introducedIds = new Set(Object.keys(state.cards));
    const remaining = PHRASES.filter((p) => !introducedIds.has(p.id));
    const toAdd = remaining.slice(0, state.settings.newPerDay);

    const cards = { ...state.cards };
    for (const phrase of toAdd) {
        cards[phrase.id] = newCard(phrase.id, today);
    }

    return {
        ...state,
        cards,
        lastGenerationDate: today,
        nextPhraseIndex: state.nextPhraseIndex + toAdd.length,
    };
}

export interface DailySession {
    reviewCards: CardState[];
    newCards: CardState[];
    reviewDueTotal: number;
    bankExhausted: boolean;
}

/** Construit la sélection de cartes à étudier aujourd'hui, mélangée aléatoirement. */
export function buildDailySession(state: AppState, today: string = todayISO()): DailySession {
    const all = Object.values(state.cards);

    const due = all
        .filter((c) => c.dueDate <= today && c.introducedDate !== today)
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

    const introducedToday = all.filter((c) => c.introducedDate === today);

    const reviewCards = shuffle(due.slice(0, state.settings.reviewPerDay));
    const newCards = shuffle(introducedToday.slice(0, state.settings.newPerDay));

    const introducedIds = new Set(Object.keys(state.cards));
    const bankExhausted = PHRASES.every((p) => introducedIds.has(p.id));

    return {
        reviewCards,
        newCards,
        reviewDueTotal: due.length,
        bankExhausted,
    };
}

export function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function getPhrase(id: string): Phrase | undefined {
    return PHRASES.find((p) => p.id === id);
}

export function totalMastered(state: AppState): number {
    return Object.values(state.cards).filter((c) => c.mastered).length;
}
