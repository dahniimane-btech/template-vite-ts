import type { Phrase } from './types';

export type EvaluationLevel = 'correct' | 'close' | 'retry';

export interface VerbAnalysis {
    form: string;
    infinitive: string;
    tense: string;
    person: string;
}

export interface ConjugationIssue {
    expected: VerbAnalysis;
    found: VerbAnalysis | null;
    explanation: string;
}

export interface SpellingIssue {
    found: string;
    expected: string;
    kind: 'spelling' | 'accent';
}

export interface TranslationEvaluation {
    level: EvaluationLevel;
    score: number;
    reference: string;
    /** True si la réponse correcte diverge nettement de la formulation de référence. */
    isAlternativePhrasing: boolean;
    missingWords: string[];
    extraWords: string[];
    conjugationIssues: ConjugationIssue[];
    spellingIssues: SpellingIssue[];
    accentWarning: boolean;
    summary: string;
}

const STOP_WORDS = new Set([
    'a', 'al', 'algo', 'ante', 'antes', 'cada', 'como', 'con', 'de', 'del',
    'desde', 'el', 'ella', 'ellos', 'en', 'entre', 'esa', 'ese', 'eso', 'esto',
    'la', 'las', 'le', 'les', 'lo', 'los', 'me',
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

type VerbMetadata = Omit<VerbAnalysis, 'form'>;

const VERB_METADATA: Record<string, VerbMetadata> = {
    acabariamos: { infinitive: 'acabar', tense: 'conditionnel présent', person: '1re personne du pluriel (nosotros)' },
    aprendan: { infinitive: 'aprender', tense: 'subjonctif présent', person: '3e personne du pluriel (ellos/ustedes)' },
    aprendas: { infinitive: 'aprender', tense: 'subjonctif présent', person: '2e personne du singulier (tú)' },
    aprobe: { infinitive: 'aprobar', tense: 'passé simple', person: '1re personne du singulier (yo)' },
    beba: { infinitive: 'beber', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    bebas: { infinitive: 'beber', tense: 'subjonctif présent', person: '2e personne du singulier (tú)' },
    cambien: { infinitive: 'cambiar', tense: 'subjonctif présent', person: '3e personne du pluriel (ellos/ustedes)' },
    consiguiera: { infinitive: 'conseguir', tense: 'subjonctif imparfait', person: '1re ou 3e personne du singulier' },
    cuidamos: { infinitive: 'cuidar', tense: 'présent de l’indicatif', person: '1re personne du pluriel (nosotros)' },
    dejaba: { infinitive: 'dejar', tense: 'imparfait de l’indicatif', person: '1re ou 3e personne du singulier' },
    deje: { infinitive: 'dejar', tense: 'passé simple', person: '1re personne du singulier (yo)' },
    dependemos: { infinitive: 'depender', tense: 'présent de l’indicatif', person: '1re personne du pluriel (nosotros)' },
    desperdicie: { infinitive: 'desperdiciar', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    discutamos: { infinitive: 'discutir', tense: 'subjonctif présent', person: '1re personne du pluriel (nosotros)' },
    empece: { infinitive: 'empezar', tense: 'passé simple', person: '1re personne du singulier (yo)' },
    empezare: { infinitive: 'empezar', tense: 'futur simple', person: '1re personne du singulier (yo)' },
    era: { infinitive: 'ser', tense: 'imparfait de l’indicatif', person: '1re ou 3e personne du singulier' },
    es: { infinitive: 'ser', tense: 'présent de l’indicatif', person: '3e personne du singulier (él/ella/usted)' },
    esta: { infinitive: 'estar', tense: 'présent de l’indicatif', person: '3e personne du singulier (él/ella/usted)' },
    estas: { infinitive: 'estar', tense: 'présent de l’indicatif', person: '2e personne du singulier (tú)' },
    este: { infinitive: 'estar', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    estoy: { infinitive: 'estar', tense: 'présent de l’indicatif', person: '1re personne du singulier (yo)' },
    existan: { infinitive: 'existir', tense: 'subjonctif présent', person: '3e personne du pluriel (ellos/ustedes)' },
    existieran: { infinitive: 'existir', tense: 'subjonctif imparfait', person: '3e personne du pluriel (ellos/ustedes)' },
    hago: { infinitive: 'hacer', tense: 'présent de l’indicatif', person: '1re personne du singulier (yo)' },
    ha: { infinitive: 'haber', tense: 'présent de l’indicatif (auxiliaire)', person: '3e personne du singulier (él/ella/usted)' },
    hay: { infinitive: 'haber', tense: 'présent de l’indicatif', person: 'forme impersonnelle' },
    hubiera: { infinitive: 'haber', tense: 'subjonctif imparfait', person: '1re ou 3e personne du singulier' },
    llevo: { infinitive: 'llevar', tense: 'présent de l’indicatif', person: '1re personne du singulier (yo)' },
    lloviera: { infinitive: 'llover', tense: 'subjonctif imparfait', person: '3e personne du singulier' },
    llueva: { infinitive: 'llover', tense: 'subjonctif présent', person: '3e personne du singulier' },
    mudaria: { infinitive: 'mudar(se)', tense: 'conditionnel présent', person: '1re ou 3e personne du singulier' },
    mudaremos: { infinitive: 'mudar(se)', tense: 'futur simple', person: '1re personne du pluriel (nosotros)' },
    pasaba: { infinitive: 'pasar', tense: 'imparfait de l’indicatif', person: '1re ou 3e personne du singulier' },
    podamos: { infinitive: 'poder', tense: 'subjonctif présent', person: '1re personne du pluriel (nosotros)' },
    prefiero: { infinitive: 'preferir', tense: 'présent de l’indicatif', person: '1re personne du singulier (yo)' },
    reduzcamos: { infinitive: 'reducir', tense: 'subjonctif présent', person: '1re personne du pluriel (nosotros)' },
    renuncie: { infinitive: 'renunciar', tense: 'passé simple', person: '1re personne du singulier (yo)' },
    salga: { infinitive: 'salir', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    sea: { infinitive: 'ser', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    sean: { infinitive: 'ser', tense: 'subjonctif présent', person: '3e personne du pluriel (ellos/ustedes)' },
    senti: { infinitive: 'sentir', tense: 'passé simple', person: '1re personne du singulier (yo)' },
    sientas: { infinitive: 'sentir(se)', tense: 'subjonctif présent', person: '2e personne du singulier (tú)' },
    sigas: { infinitive: 'seguir', tense: 'subjonctif présent', person: '2e personne du singulier (tú)' },
    sufriran: { infinitive: 'sufrir', tense: 'futur simple', person: '3e personne du pluriel (ellos/ustedes)' },
    suelo: { infinitive: 'soler', tense: 'présent de l’indicatif', person: '1re personne du singulier (yo)' },
    tenga: { infinitive: 'tener', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    tengas: { infinitive: 'tener', tense: 'subjonctif présent', person: '2e personne du singulier (tú)' },
    terminamos: { infinitive: 'terminar', tense: 'présent ou passé simple', person: '1re personne du pluriel (nosotros)' },
    termine: { infinitive: 'terminar', tense: 'subjonctif présent', person: '1re ou 3e personne du singulier' },
    terminemos: { infinitive: 'terminar', tense: 'subjonctif présent', person: '1re personne du pluriel (nosotros)' },
    trabajamos: { infinitive: 'trabajar', tense: 'présent ou passé simple', person: '1re personne du pluriel (nosotros)' },
    trabajando: { infinitive: 'trabajar', tense: 'gérondif', person: 'forme impersonnelle' },
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
    spellingIssues: SpellingIssue[];
}

function scoreCandidate(answer: string, reference: string): CandidateScore {
    const expected = contentTokens(reference);
    const actual = contentTokens(answer);
    const used = new Set<number>();
    const missingWords: string[] = [];
    const conjugationIssues: Array<{ expected: string; found: string }> = [];
    const spellingIssues: SpellingIssue[] = [];
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
                spellingIssues.push({ expected: expectedToken, found, kind: 'spelling' });
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
        spellingIssues,
    };
}

function inferRegularVerb(form: string): VerbAnalysis | null {
    const normalized = stripAccents(form);
    const nonFinitePatterns: Array<[RegExp, string, string]> = [
        [/ando$/, 'ar', 'gérondif'],
        [/iendo$/, 'er', 'gérondif'],
        [/ado$/, 'ar', 'participe passé'],
        [/ido$/, 'er', 'participe passé'],
        [/ar$/, '', 'infinitif'],
        [/er$/, '', 'infinitif'],
        [/ir$/, '', 'infinitif'],
    ];

    for (const [pattern, ending, tense] of nonFinitePatterns) {
        if (!pattern.test(normalized)) continue;
        let infinitive = normalized;
        if (tense === 'gérondif' || tense === 'participe passé') {
            infinitive = normalized.replace(pattern, ending);
        }
        return { form, infinitive, tense, person: 'forme impersonnelle' };
    }
    return null;
}

function analyzeVerb(form: string): VerbAnalysis {
    const normalized = stripAccents(form);
    const metadata = VERB_METADATA[normalized];
    if (metadata) return { form, ...metadata };

    return inferRegularVerb(form) ?? {
        form,
        infinitive: 'non identifié localement',
        tense: 'forme verbale à vérifier',
        person: 'personne à vérifier dans le contexte',
    };
}

function detailConjugationIssue(expected: string, found: string): ConjugationIssue {
    const expectedAnalysis = analyzeVerb(expected);
    const foundAnalysis = found ? analyzeVerb(found) : null;
    const sameInfinitive = foundAnalysis
        && expectedAnalysis.infinitive !== 'non identifié localement'
        && expectedAnalysis.infinitive === foundAnalysis.infinitive;
    const explanation = !foundAnalysis
        ? `Il manque le verbe « ${expectedAnalysis.infinitive} » sous la forme « ${expected} ».`
        : sameInfinitive
            ? `Le verbe est correct, mais la forme ne correspond pas au temps ou à la personne attendue.`
            : `La proposition attend ici « ${expected} », forme du verbe « ${expectedAnalysis.infinitive} ».`;

    return { expected: expectedAnalysis, found: foundAnalysis, explanation };
}

function findAccentIssues(answer: string, reference: string): SpellingIssue[] {
    const actual = tokenize(answer, true);
    const expected = tokenize(reference, true);
    const issues: SpellingIssue[] = [];
    const length = Math.min(actual.length, expected.length);

    for (let index = 0; index < length; index++) {
        if (
            actual[index] !== expected[index]
            && stripAccents(actual[index]) === stripAccents(expected[index])
        ) {
            issues.push({ found: actual[index], expected: expected[index], kind: 'accent' });
        }
    }
    return issues;
}

function restoreWrittenForm(normalizedForm: string, source: string): string {
    return tokenize(source, true).find(
        (token) => stripAccents(token) === stripAccents(normalizedForm),
    ) ?? normalizedForm;
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
    const missingVerbIssues = scored.missingWords
        .filter(isLikelyVerb)
        .map((expected) => ({
            expected: restoreWrittenForm(expected, scored.reference),
            found: '',
        }));
    const conjugationIssues = [...scored.conjugationIssues, ...missingVerbIssues]
        .map((issue) => detailConjugationIssue(
            restoreWrittenForm(issue.expected, scored.reference),
            issue.found ? restoreWrittenForm(issue.found, answer) : '',
        ))
        .slice(0, 4);
    const spellingIssues = [
        ...scored.spellingIssues,
        ...findAccentIssues(answer, scored.reference),
    ].filter((issue, index, all) => all.findIndex(
        (candidate) => candidate.found === issue.found
            && candidate.expected === issue.expected
            && candidate.kind === issue.kind,
    ) === index).slice(0, 6);

    let level: EvaluationLevel;
    const missingVerb = scored.missingWords.some(isLikelyVerb);
    if (scored.score >= 0.82 && conjugationIssues.length === 0 && !missingVerb) {
        level = 'correct';
    } else if (scored.score >= 0.58) {
        level = 'close';
    } else {
        level = 'retry';
    }

    // Une réponse correcte est jugée "alternative" quand elle ne reprend pas
    // mot pour mot la proposition de référence : autre ordre, synonyme, tournure
    // différente. Dans ce cas on l'accepte sans la corriger.
    const isAlternativePhrasing = level === 'correct' && answerWithoutAccents !== referenceWithoutAccents;

    const summary = level === 'correct'
        ? isAlternativePhrasing
            ? 'Très bien : ta formulation est différente mais la conjugaison et le lexique sont corrects, donc elle est acceptée.'
            : 'Très bien : le sens, le lexique et les formes verbales sont cohérents.'
        : level === 'close'
            ? 'Bonne idée générale, mais quelques éléments sont à corriger.'
            : 'La réponse est encore trop éloignée : compare-la avec la proposition.';

    return {
        level,
        score: Math.round(scored.score * 100),
        reference: scored.reference,
        isAlternativePhrasing,
        missingWords: scored.missingWords.slice(0, 5),
        extraWords: scored.extraWords.slice(0, 5),
        conjugationIssues,
        spellingIssues,
        accentWarning,
        summary,
    };
}
