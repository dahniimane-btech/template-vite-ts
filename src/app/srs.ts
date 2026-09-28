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
        lastReviewedDate: today,
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
 * par jour).
 *
 * Les phrases d'une liste précédente jamais étudiées sont reportées telles
 * quelles : si l'on ne se connecte pas un jour, on retrouve le lendemain la
 * liste qu'on aurait dû voir. On complète ensuite, au hasard, jusqu'à
 * `settings.newPerDay` phrases.
 */
export function ensureDailyGeneration(state: AppState, today: string = todayISO()): AppState {
    if (state.lastGenerationDate === today) {
        return state;
    }

    const cards = { ...state.cards };
    const pending = Object.values(cards).filter(
        (card) => card.reviewCount === 0 && card.introducedDate < today,
    );
    for (const card of pending) {
        cards[card.id] = { ...card, introducedDate: today, dueDate: today };
    }

    const introducedIds = new Set(Object.keys(cards));
    const remaining = PHRASES.filter((p) => !introducedIds.has(p.id));
    const missing = Math.max(0, state.settings.newPerDay - pending.length);
    const toAdd = shuffle(remaining).slice(0, missing);

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

/**
 * Remplace les phrases du jour encore jamais notées par d'autres phrases
 * inédites tirées au hasard. Les cartes déjà étudiées aujourd'hui et tout
 * l'historique de révision sont préservés.
 */
export function rerollDailyNewCards(state: AppState, today: string = todayISO()): AppState {
    const untouched = Object.values(state.cards).filter(
        (card) => card.introducedDate === today && card.reviewCount === 0,
    );
    if (untouched.length === 0) return state;

    const discardedIds = new Set(untouched.map((card) => card.id));
    const cards = { ...state.cards };
    for (const id of discardedIds) delete cards[id];

    // On exclut les phrases qu'on vient de retirer pour garantir une
    // sélection réellement différente.
    const keptIds = new Set(Object.keys(cards));
    const pool = PHRASES.filter((p) => !keptIds.has(p.id) && !discardedIds.has(p.id));
    const replacements = shuffle(pool).slice(0, untouched.length);

    // Banque épuisée : on recycle les phrases écartées plutôt que de rendre
    // la séance vide.
    const fallback = replacements.length < untouched.length
        ? shuffle(PHRASES.filter((p) => discardedIds.has(p.id)))
            .slice(0, untouched.length - replacements.length)
        : [];

    for (const phrase of [...replacements, ...fallback]) {
        cards[phrase.id] = newCard(phrase.id, today);
    }

    return { ...state, cards };
}

export interface DailySession {
    reviewCards: CardState[];
    newCards: CardState[];
    reviewDueTotal: number;
    /** Cartes découvertes hier et donc à revoir aujourd'hui. */
    yesterdayCount: number;
    /** Arriéré restant après la séance du jour. */
    backlogLeft: number;
    bankExhausted: boolean;
    /** Nombre de phrases encore jamais découvertes dans la banque. */
    bankRemaining: number;
}

export interface WritingSession {
    cards: CardState[];
    /** `label` = rang du jour d'apprentissage (J-1 = dernière liste étudiée). */
    byDay: Array<{ date: string; label: string; count: number }>;
    /** Nombre de listes différentes disponibles avec le quota courant. */
    variantCount: number;
}

/** Prend `count` éléments à partir d'un décalage, en bouclant sur la liste. */
function rotateSlice<T>(items: T[], count: number, rotation: number): T[] {
    if (items.length === 0 || count <= 0) return [];
    const take = Math.min(count, items.length);
    const start = ((rotation * take) % items.length + items.length) % items.length;
    return Array.from({ length: take }, (_, i) => items[(start + i) % items.length]);
}

/**
 * Dates des listes précédentes (jours d'apprentissage réels), de la plus
 * récente à la plus ancienne. Un jour sans connexion n'y figure pas : J-1
 * désigne donc toujours la dernière liste étudiée.
 */
export function previousBatchDates(state: AppState, today: string = todayISO()): string[] {
    const dates = new Set<string>();
    for (const card of Object.values(state.cards)) {
        if (card.introducedDate < today) dates.add(card.introducedDate);
    }
    return [...dates].sort((a, b) => b.localeCompare(a));
}

/**
 * Entraînement FR → ES : mélange équilibré des listes J-1, J-2 et J-3
 * (7 + 7 + 6 pour 20 phrases). Si le quota dépasse ce qu'elles contiennent,
 * on complète avec J-4, J-5… Le premier jour, faute d'historique, on
 * s'entraîne sur la liste du jour.
 *
 * `writingRotation` fait défiler les phrases de chaque liste sans avoir à les
 * étudier (bouton « Changer la liste »).
 */
export function buildWritingSession(
    state: AppState,
    today: string = todayISO(),
): WritingSession {
    const limit = Math.max(0, state.settings.writingPerDay);
    const rotation = state.writingRotation ?? 0;
    const cardsByDate = new Map<string, CardState[]>();

    Object.values(state.cards)
        .filter((card) => card.introducedDate <= today)
        .forEach((card) => {
            const cards = cardsByDate.get(card.introducedDate) ?? [];
            cards.push(card);
            cardsByDate.set(card.introducedDate, cards);
        });

    let dates = previousBatchDates(state, today);
    const fallbackToday = dates.length === 0;
    if (fallbackToday) dates = cardsByDate.has(today) ? [today] : [];

    const size = (date: string) => cardsByDate.get(date)?.length ?? 0;
    const alloc = new Map<string, number>();
    let remaining = limit;

    // Répartition équitable entre les trois dernières listes ; ce qu'une
    // liste trop courte ne peut pas fournir est reporté sur les autres.
    let active = dates.slice(0, 3).filter((date) => size(date) > 0);
    while (remaining > 0 && active.length > 0) {
        const share = Math.ceil(remaining / active.length);
        for (const date of active) {
            const give = Math.min(share, size(date) - (alloc.get(date) ?? 0), remaining);
            alloc.set(date, (alloc.get(date) ?? 0) + give);
            remaining -= give;
        }
        active = active.filter((date) => (alloc.get(date) ?? 0) < size(date));
    }
    for (const date of dates.slice(3)) {
        if (remaining <= 0) break;
        const give = Math.min(size(date), remaining);
        if (give > 0) alloc.set(date, give);
        remaining -= give;
    }

    const cards: CardState[] = [];
    const byDay: WritingSession['byDay'] = [];
    let variantCount = 1;

    dates.forEach((date, index) => {
        const take = alloc.get(date) ?? 0;
        if (take <= 0) return;
        const dayCards = cardsByDate.get(date) ?? [];
        const selected = rotateSlice(dayCards, take, rotation);
        cards.push(...selected);
        byDay.push({ date, label: fallbackToday ? 'J' : `J-${index + 1}`, count: selected.length });
        variantCount = Math.max(variantCount, Math.ceil(dayCards.length / take));
    });

    return { cards, byDay, variantCount };
}

/**
 * Construit la sélection de cartes à étudier aujourd'hui, mélangée aléatoirement.
 *
 * Règles :
 * - les cartes découvertes aujourd'hui et déjà notées (donc repoussées à
 *   demain) ne réapparaissent pas si l'on relance une séance le même jour ;
 * - les phrases découvertes hier sont toujours révisées en priorité, puis on
 *   complète avec l'arriéré le plus ancien.
 */
export function buildDailySession(state: AppState, today: string = todayISO()): DailySession {
    const all = Object.values(state.cards);
    // Dernière liste étudiée (et non la date d'hier) : si l'on saute un jour,
    // les révisions prévues ne sont pas perdues.
    const yesterday = previousBatchDates(state, today)[0] ?? addDays(today, -1);

    const due = all.filter((c) => c.dueDate <= today && c.introducedDate !== today);

    const fromYesterday = due.filter((c) => c.introducedDate === yesterday);
    const backlog = due
        .filter((c) => c.introducedDate !== yesterday)
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

    // Quota d'arriéré déjà consommé aujourd'hui : le plan du jour reste stable
    // même si l'utilisateur relance une séance après l'avoir terminée.
    const backlogDoneToday = all.filter(
        (c) =>
            c.lastReviewedDate === today &&
            c.introducedDate !== today &&
            c.introducedDate !== yesterday,
    ).length;

    // Les phrases de J-1 sont garanties : la limite quotidienne ne peut pas
    // les tronquer, elle sert seulement à doser l'arriéré plus ancien.
    const backlogSlots = Math.max(0, state.settings.reviewPerDay - backlogDoneToday);
    const selectedReviews = [...fromYesterday, ...backlog.slice(0, backlogSlots)];

    const introducedToday = all.filter(
        (c) => c.introducedDate === today && c.dueDate <= today,
    );

    const reviewCards = shuffle(selectedReviews);
    const newCards = shuffle(introducedToday.slice(0, state.settings.newPerDay));

    const introducedIds = new Set(Object.keys(state.cards));
    const bankRemaining = PHRASES.filter((p) => !introducedIds.has(p.id)).length;

    return {
        reviewCards,
        newCards,
        reviewDueTotal: due.length,
        yesterdayCount: fromYesterday.length,
        backlogLeft: Math.max(0, backlog.length - backlogSlots),
        bankExhausted: bankRemaining === 0,
        bankRemaining,
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
