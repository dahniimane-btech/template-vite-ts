import type { Phrase } from './types';
import {
    analyzeSentenceVerbs,
    analyzeVerbAt,
    formationHint,
    isKnownVerbForm,
    regularizedForm,
    tokenizeSentence,
    type VerbInsight,
} from './conjugation';

export type EvaluationLevel = 'correct' | 'close' | 'retry';

export interface VerbAnalysis {
    form: string;
    infinitive: string;
    tense: string;
    person: string;
    /** Pourquoi ce temps / ce mode est employé dans la phrase. */
    reason?: string;
}

export interface ConjugationIssue {
    expected: VerbAnalysis;
    found: VerbAnalysis | null;
    explanation: string;
    /** Rappel de formation du temps attendu et irrégularités du verbe. */
    formation?: string;
}

export interface VerbReport {
    form: string;
    infinitive: string;
    tense: string;
    person: string;
    reason: string;
    status: 'ok' | 'wrong' | 'missing';
    userForm?: string;
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
    /** Analyse de tous les verbes de la proposition retenue. */
    verbs: VerbReport[];
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
    return isKnownVerbForm(token)
        || /(?:ar|er|ir|ando|iendo|ado|ido|aba|aban|aron|ieron|aria|eria|iria|aremos|eremos|iremos)$/.test(normalized);
}

/** Mots (sans accents) qui appartiennent à un groupe verbal de la phrase, d'après le contexte. */
function referenceVerbTokens(reference: string): Set<string> {
    const tokens = tokenizeSentence(reference);
    const result = new Set<string>();
    for (const insight of analyzeSentenceVerbs(reference)) {
        for (let i = insight.index; i < insight.index + insight.span; i++) {
            result.add(stripAccents(tokens[i]));
        }
    }
    return result;
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
    const referenceVerbs = referenceVerbTokens(reference);
    const isReferenceVerb = (token: string) => referenceVerbs.has(token);
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
            if (isReferenceVerb(expectedToken)) {
                conjugationIssues.push({ expected: expectedToken, found });
                matchPoints += 0.3;
            } else {
                spellingIssues.push({ expected: expectedToken, found, kind: 'spelling' });
                matchPoints += 0.65;
            }
        } else if (
            closestIndex >= 0
            && isReferenceVerb(expectedToken)
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

function withArticle(label: string): string {
    return /^[aeiouéh]/i.test(label) ? `l’${label}` : `le ${label}`;
}

function toAnalysis(insight: VerbInsight): VerbAnalysis {
    return {
        form: insight.form,
        infinitive: insight.infinitive,
        tense: insight.tenseLabel,
        person: insight.person,
        reason: insight.reason,
    };
}

function analyzeFormInSentence(sentence: string, form: string, strict: boolean, prefer?: VerbInsight): VerbInsight | null {
    const tokens = tokenizeSentence(sentence);
    const target = stripAccents(form.toLocaleLowerCase('es'));
    const index = tokens.findIndex((token) => stripAccents(token) === target);
    if (index < 0) return null;
    return analyzeVerbAt(tokens, index, {
        strict,
        prefer: prefer
            ? { infinitive: prefer.lemma, tense: prefer.tense, person: prefer.persons[0] ?? -1 }
            : undefined,
    });
}

function samePerson(a: VerbInsight, b: VerbInsight): boolean {
    return a.persons.some((person) => b.persons.includes(person));
}

const SUBJUNCTIVE = new Set(['subj_presente', 'subj_imperfecto', 'subj_perfecto', 'subj_pluscuamperfecto']);

function auTemps(label: string): string {
    return /^[aeiouéh]/i.test(label) ? `à l’${label}` : `au ${label}`;
}

function explainIssue(expected: VerbInsight, found: VerbInsight | null, foundForm: string): { explanation: string; formation?: string; regularized?: boolean } {
    const target = `« ${expected.form} » (${expected.tenseLabel}, ${expected.person})`;
    const formation = formationHint(expected.lemma, expected.tense, expected.persons) || undefined;

    if (!foundForm) {
        return {
            explanation: `Il manque le verbe « ${expected.infinitive} » : ici on attend ${target}.`,
            formation,
        };
    }
    // Forme « régularisée » d'un verbe irrégulier ou à diphtongue (penso au lieu de pienso).
    const person = expected.persons.find((p) => p >= 0 && p <= 5) ?? -1;
    const regular = expected.span === 1 ? regularizedForm(expected.lemma, expected.tense, person) : null;
    if (regular && stripAccents(regular) === stripAccents(foundForm) && stripAccents(regular) !== stripAccents(expected.form)) {
        return {
            explanation: `Bon verbe (« ${expected.infinitive} ») et bon temps (${expected.tenseLabel}), mais tu l’as conjugué comme un verbe régulier : on écrit « ${expected.form} » et non « ${foundForm} ».`,
            formation,
            regularized: true,
        };
    }
    if (!found) {
        return {
            explanation: `« ${foundForm} » n’est pas une forme correcte. Le verbe est « ${expected.infinitive} » : on écrit ${target}.`,
            formation,
        };
    }
    const written = found.form;
    if (found.lemma !== expected.lemma) {
        const pair = [found.lemma, expected.lemma].sort().join('/');
        const note = pair === 'estar/ser'
            ? ' Rappel : « estar » exprime un état passager, une localisation ou le résultat d’un changement ; « ser » exprime l’identité, une caractéristique durable ou l’heure.'
            : found.tense === expected.tense && samePerson(found, expected)
                ? ' Le temps et la personne sont bons : seul le choix du verbe diffère.'
                : '';
        return {
            explanation: `Tu as utilisé le verbe « ${found.infinitive} » (« ${written} », ${found.tenseLabel}). Ici on attend le verbe « ${expected.infinitive} » : ${target}.${note}`,
        };
    }
    if (found.tense !== expected.tense) {
        const parts = [
            `Bon verbe (« ${expected.infinitive} »), mais « ${written} » est ${auTemps(found.tenseLabel)}, alors qu’il faut ${withArticle(expected.tenseLabel)} : « ${expected.form} ».`,
        ];
        if (SUBJUNCTIVE.has(expected.tense) && !SUBJUNCTIVE.has(found.tense)) {
            parts.push('C’est une erreur de mode : il faut le subjonctif, pas l’indicatif.');
        } else if (!SUBJUNCTIVE.has(expected.tense) && SUBJUNCTIVE.has(found.tense)) {
            parts.push('C’est une erreur de mode : ici l’indicatif suffit, le subjonctif n’est pas déclenché.');
        }
        if (!samePerson(found, expected) && expected.persons.some((p) => p >= 0 && p <= 5)) {
            parts.push(`La personne ne colle pas non plus : il faut ${expected.person}.`);
        }
        return { explanation: parts.join(' '), formation };
    }
    if (!samePerson(found, expected)) {
        return {
            explanation: `Bon verbe (« ${expected.infinitive} ») et bon temps (${expected.tenseLabel}), mais mauvaise personne : « ${written} » correspond à ${found.person}, alors qu’il faut ${expected.person} (« ${expected.form} »). Vérifie le sujet de la phrase.`,
            formation,
        };
    }
    return {
        explanation: `Bon verbe et bon temps, mais la forme s’écrit « ${expected.form} ».`,
        formation,
    };
}

interface DetailedIssue {
    issue: ConjugationIssue;
    /** Position du groupe verbal attendu dans la proposition (-1 si non analysé). */
    index: number;
    foundForm: string;
}

function detailConjugationIssue(expectedForm: string, foundForm: string, reference: string, answer: string): DetailedIssue {
    const expected = analyzeFormInSentence(reference, expectedForm, true)
        ?? analyzeFormInSentence(reference, expectedForm, false);
    const found = foundForm ? analyzeFormInSentence(answer, foundForm, false, expected ?? undefined) : null;

    if (!expected) {
        const explanation = foundForm
            ? `La proposition attend ici « ${expectedForm} » au lieu de « ${foundForm} ».`
            : `Il manque la forme verbale « ${expectedForm} ».`;
        return {
            issue: {
                expected: { form: expectedForm, infinitive: 'non identifié', tense: 'forme à vérifier', person: 'à vérifier dans le contexte' },
                found: found ? toAnalysis(found) : null,
                explanation,
            },
            index: -1,
            foundForm,
        };
    }

    const { explanation, formation, regularized } = explainIssue(expected, found, foundForm);
    const foundAnalysis: VerbAnalysis | null = !foundForm
        ? null
        : regularized
            ? { form: foundForm, infinitive: expected.infinitive, tense: 'conjugué comme un verbe régulier (forme incorrecte)', person: expected.person }
            : found
            ? { ...toAnalysis(found), reason: undefined }
            : { form: foundForm, infinitive: 'forme inconnue', tense: 'forme non reconnue', person: '—' };
    return {
        issue: { expected: toAnalysis(expected), found: foundAnalysis, explanation, formation },
        index: expected.index,
        foundForm,
    };
}

function buildVerbReport(reference: string, issues: DetailedIssue[]): VerbReport[] {
    return analyzeSentenceVerbs(reference).map((insight) => {
        const related = issues.find((entry) => entry.index === insight.index);
        return {
            form: insight.form,
            infinitive: insight.infinitive,
            tense: insight.tenseLabel,
            person: insight.person,
            reason: insight.reason,
            status: !related ? 'ok' : related.foundForm ? 'wrong' : 'missing',
            userForm: related?.foundForm || undefined,
        };
    });
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
    const referenceVerbs = referenceVerbTokens(scored.reference);
    // Un verbe de la proposition absent de la réponse est rapproché d'un verbe
    // « en trop » de la réponse (synonyme ou autre verbe employé à sa place).
    const spareVerbs = scored.extraWords.filter((word) => isKnownVerbForm(word)
        && analyzeFormInSentence(answer, restoreWrittenForm(word, answer), false) !== null);
    const missingVerbIssues = scored.missingWords
        .filter((word) => referenceVerbs.has(word))
        .map((expected) => ({
            expected: restoreWrittenForm(expected, scored.reference),
            found: spareVerbs.shift() ?? '',
        }));
    const detailedIssues = [...scored.conjugationIssues, ...missingVerbIssues]
        .map((issue) => detailConjugationIssue(
            restoreWrittenForm(issue.expected, scored.reference),
            issue.found ? restoreWrittenForm(issue.found, answer) : '',
            scored.reference,
            answer,
        ))
        // Un temps composé peut produire deux écarts (auxiliaire + participe) : on n'en garde qu'un.
        .filter((entry, index, all) => entry.index < 0 || all.findIndex((other) => other.index === entry.index) === index)
        .slice(0, 4);
    const conjugationIssues = detailedIssues.map((entry) => entry.issue);
    const verbs = buildVerbReport(scored.reference, detailedIssues);
    const spellingIssues = [
        ...scored.spellingIssues,
        ...findAccentIssues(answer, scored.reference),
    ].filter((issue, index, all) => all.findIndex(
        (candidate) => candidate.found === issue.found
            && candidate.expected === issue.expected
            && candidate.kind === issue.kind,
    ) === index).slice(0, 6);

    let level: EvaluationLevel;
    const missingVerb = scored.missingWords.some((word) => referenceVerbs.has(word));
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
        verbs,
        spellingIssues,
        accentWarning,
        summary,
    };
}
