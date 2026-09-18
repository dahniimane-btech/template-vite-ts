import type { Phrase } from './types';

export type EvaluationLevel = 'correct' | 'close' | 'retry';

export interface TranslationEvaluation {
    level: EvaluationLevel;
    score: number;
    reference: string;
    missingWords: string[];
    extraWords: string[];
    conjugationIssues: Array<{ expected: string; found: string }>;
    accentWarning: boolean;
    summary: string;
}

const STOP_WORDS = new Set([
    'a', 'al', 'algo', 'ante', 'antes', 'cada', 'como', 'con', 'de', 'del',
    'desde', 'el', 'ella', 'ellos', 'en', 'entre', 'esa', 'ese', 'eso', 'esta',
    'este', 'esto', 'ha', 'hay', 'la', 'las', 'le', 'les', 'lo', 'los', 'me',
    'mi', 'mis', 'mucho', 'muy', 'nos', 'o', 'para', 'pero', 'por', 'que',
    'se', 'si', 'sin', 'su', 'sus', 'te', 'tu', 'tus', 'un', 'una', 'uno',
    'unos', 'y', 'ya', 'yo',
]);

const SYNONYMS: Record<string, string> = {
    apartamento: 'piso',
    auto: 'coche',
    automóvil: 'coche',
    celular: 'móvil',
    computadora: 'ordenador',
    empleo: 'trabajo',
    finalizar: 'terminar',
    iniciar: 'empezar',
    plata: 'dinero',
    vivienda: 'casa',
};

const VERB_FORMS = new Set([
    'acabaríamos', 'acabaremos', 'acabó', 'aprendas', 'aprendamos', 'aprobado',
    'aprobaría', 'apuntarme', 'avisar', 'beba', 'bebas', 'cambiar', 'cambien',
    'cocinar', 'comer', 'comiendo', 'compara', 'confiar', 'consiguiera',
    'contaminar', 'cuidamos', 'dejaba', 'dejé', 'dependemos', 'desperdicie',
    'despierto', 'despierto', 'discutamos', 'dormir', 'ducharme', 'empecé',
    'empezar', 'empezaré', 'encanta', 'encuentro', 'esperar', 'espero',
    'es', 'era', 'eran', 'eres', 'está', 'estaba', 'estaban', 'estamos', 'estás',
    'esté', 'estoy', 'estudiado', 'estudiar', 'existan', 'existieran', 'fue',
    'fueran', 'hace', 'hagan',
    'hago', 'hubiera', 'hubiéramos', 'intento', 'ir', 'levantarme', 'llevo',
    'lloviera', 'llueva', 'logro', 'mantener', 'mudaría', 'mudaremos', 'pague',
    'paguen', 'pasaba', 'pasado', 'pedir', 'pensado', 'pienso', 'pierdo',
    'podamos', 'prefiero', 'probado', 'quedarme', 'quieren', 'quieres',
    'quiero', 'reduzcamos', 'renuncié', 'reservar', 'salga', 'salir', 'sientas',
    'siento', 'sigas', 'sigue', 'soñaba', 'soporto', 'sufrirán', 'suelo',
    'sea', 'sean', 'soy', 'tenga', 'tengas', 'tengo', 'terminamos', 'termine',
    'terminemos', 'tomar', 'trabajando',
    'trabajemos', 'traído', 'viajar', 'viajo', 'vivir', 'vuelva',
].map(stripAccents));

function stripAccents(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenize(value: string, keepAccents = false): string[] {
    const normalized = value
        .toLocaleLowerCase('es')
        .replace(/[¿¡]/g, '')
        .replace(/[’']/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const text = keepAccents ? normalized : stripAccents(normalized);
    return text ? text.split(' ') : [];
}

function canonical(token: string): string {
    return SYNONYMS[token] ?? token;
}

function contentTokens(value: string): string[] {
    return tokenize(value)
        .map(canonical)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function levenshtein(a: string, b: string): number {
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

    for (let i = 1; i <= a.length; i++) {
        let diagonal = previous[0];
        previous[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const above = previous[j];
            previous[j] = Math.min(
                previous[j] + 1,
                previous[j - 1] + 1,
                diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
            );
            diagonal = above;
        }
    }

    return previous[b.length];
}

function commonPrefixLength(a: string, b: string): number {
    let length = 0;
    while (length < a.length && length < b.length && a[length] === b[length]) {
        length++;
    }
    return length;
}

function isLikelyVerb(token: string): boolean {
    const normalized = stripAccents(token);
    return VERB_FORMS.has(normalized)
        || /(?:ar|er|ir|ando|iendo|ado|ido|aba|aban|aron|ieron|aria|eria|iria|aremos|eremos|iremos)$/.test(normalized);
}

interface CandidateScore {
    score: number;
    missingWords: string[];
    extraWords: string[];
    conjugationIssues: Array<{ expected: string; found: string }>;
}

function scoreCandidate(answer: string, reference: string): CandidateScore {
    const expected = contentTokens(reference);
    const actual = contentTokens(answer);
    const used = new Set<number>();
    const missingWords: string[] = [];
    const conjugationIssues: Array<{ expected: string; found: string }> = [];
    let matchPoints = 0;

    for (const expectedToken of expected) {
        const exactIndex = actual.findIndex((token, index) => !used.has(index) && token === expectedToken);
        if (exactIndex >= 0) {
            used.add(exactIndex);
            matchPoints += 1;
            continue;
        }

        let closestIndex = -1;
        let closestDistance = Number.POSITIVE_INFINITY;
        actual.forEach((token, index) => {
            if (used.has(index)) return;
            const distance = levenshtein(expectedToken, token);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        const fuzzyLimit = expectedToken.length >= 7 ? 2 : expectedToken.length >= 4 ? 1 : 0;
        if (closestIndex >= 0 && closestDistance <= fuzzyLimit) {
            const found = actual[closestIndex];
            used.add(closestIndex);
            if (isLikelyVerb(expectedToken)) {
                conjugationIssues.push({ expected: expectedToken, found });
                matchPoints += 0.3;
            } else {
                matchPoints += 0.65;
            }
        } else if (
            closestIndex >= 0
            && isLikelyVerb(expectedToken)
            && (
                commonPrefixLength(expectedToken, actual[closestIndex])
                    >= Math.max(4, Math.floor(Math.min(expectedToken.length, actual[closestIndex].length) * 0.55))
                || (
                    isLikelyVerb(actual[closestIndex])
                    && closestDistance <= Math.max(3, Math.floor(expectedToken.length * 0.45))
                )
            )
        ) {
            const found = actual[closestIndex];
            used.add(closestIndex);
            conjugationIssues.push({ expected: expectedToken, found });
            matchPoints += 0.2;
        } else {
            missingWords.push(expectedToken);
        }
    }

    const extraWords = actual.filter((_, index) => !used.has(index));
    const coverage = expected.length ? matchPoints / expected.length : 0;
    const precision = actual.length
        ? Math.max(0, (actual.length - extraWords.length) / actual.length)
        : 0;
    const lengthBalance = expected.length && actual.length
        ? Math.min(expected.length, actual.length) / Math.max(expected.length, actual.length)
        : 0;

    return {
        score: (coverage * 0.7) + (precision * 0.2) + (lengthBalance * 0.1),
        missingWords,
        extraWords,
        conjugationIssues,
    };
}

export function evaluateTranslation(answer: string, phrase: Phrase): TranslationEvaluation {
    const references = [phrase.es, ...(phrase.alternatives ?? [])];
    const scored = references
        .map((reference) => ({ reference, ...scoreCandidate(answer, reference) }))
        .sort((a, b) => b.score - a.score)[0];

    const answerWithoutAccents = tokenize(answer).join(' ');
    const referenceWithoutAccents = tokenize(scored.reference).join(' ');
    const answerWithAccents = tokenize(answer, true).join(' ');
    const referenceWithAccents = tokenize(scored.reference, true).join(' ');
    const accentWarning = answerWithoutAccents === referenceWithoutAccents
        && answerWithAccents !== referenceWithAccents;

    let level: EvaluationLevel;
    const missingVerb = scored.missingWords.some(isLikelyVerb);
    if (scored.score >= 0.82 && scored.conjugationIssues.length === 0 && !missingVerb) {
        level = 'correct';
    } else if (scored.score >= 0.58) {
        level = 'close';
    } else {
        level = 'retry';
    }

    const summary = level === 'correct'
        ? 'Très bien : le sens, le lexique et les formes verbales sont cohérents.'
        : level === 'close'
            ? 'Bonne idée générale, mais quelques éléments sont à corriger.'
            : 'La réponse est encore trop éloignée : compare-la avec la proposition.';

    return {
        level,
        score: Math.round(scored.score * 100),
        reference: scored.reference,
        missingWords: scored.missingWords.slice(0, 5),
        extraWords: scored.extraWords.slice(0, 5),
        conjugationIssues: scored.conjugationIssues.slice(0, 3),
        accentWarning,
        summary,
    };
}
