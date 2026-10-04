/**
 * Analyse locale des verbes espagnols : conjugueur (réguliers, changements de
 * radical, irréguliers courants), index inversé « forme -> infinitif / temps /
 * personne » et règles d'emploi expliquant le choix du temps dans une phrase.
 */

export type TenseKey =
    | 'presente' | 'indefinido' | 'imperfecto' | 'futuro' | 'condicional'
    | 'subj_presente' | 'subj_imperfecto' | 'imperativo'
    | 'infinitivo' | 'gerundio' | 'participio'
    | 'perfecto' | 'pluscuamperfecto' | 'futuro_perfecto' | 'condicional_perfecto'
    | 'subj_perfecto' | 'subj_pluscuamperfecto' | 'infinitivo_compuesto';

export interface FormEntry {
    infinitive: string;
    tense: TenseKey;
    /** 0..5 = yo..ellos, 6 = impersonnel, -1 = forme non personnelle. */
    person: number;
}

export interface VerbInsight {
    /** Forme telle qu'écrite dans la phrase (avec auxiliaire éventuel). */
    form: string;
    infinitive: string;
    /** Infinitif sans pronom réfléchi (clé du conjugueur). */
    lemma: string;
    tense: TenseKey;
    tenseLabel: string;
    person: string;
    /** Personnes possibles (0 = yo … 5 = ellos, -1 = non conjugué, 6 = « hay »). */
    persons: number[];
    reason: string;
    /** Position du premier mot du groupe verbal dans la phrase. */
    index: number;
    /** Nombre de mots couverts (2 pour un temps composé). */
    span: number;
}

export const TENSE_LABELS: Record<TenseKey, string> = {
    presente: 'présent de l’indicatif',
    indefinido: 'passé simple (pretérito indefinido)',
    imperfecto: 'imparfait de l’indicatif (pretérito imperfecto)',
    futuro: 'futur simple',
    condicional: 'conditionnel présent',
    subj_presente: 'subjonctif présent',
    subj_imperfecto: 'subjonctif imparfait',
    imperativo: 'impératif',
    infinitivo: 'infinitif',
    gerundio: 'gérondif',
    participio: 'participe passé',
    perfecto: 'passé composé (pretérito perfecto)',
    pluscuamperfecto: 'plus-que-parfait (pluscuamperfecto)',
    futuro_perfecto: 'futur antérieur',
    condicional_perfecto: 'conditionnel passé',
    subj_perfecto: 'subjonctif passé',
    subj_pluscuamperfecto: 'subjonctif plus-que-parfait',
    infinitivo_compuesto: 'infinitif passé',
};

const PERSON_LONG = [
    '1re personne du singulier', '2e personne du singulier', '3e personne du singulier',
    '1re personne du pluriel', '2e personne du pluriel', '3e personne du pluriel',
];
const PERSON_SHORT = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ustedes'];

export function personLabel(persons: number[]): string {
    const finite = [...new Set(persons)].filter((p) => p >= 0 && p <= 5).sort();
    if (finite.length === 0) {
        return persons.includes(6) ? 'forme impersonnelle' : 'forme non conjuguée';
    }
    if (finite.length === 2 && finite[0] === 0 && finite[1] === 2) {
        return '1re ou 3e personne du singulier (yo ou él/ella/usted)';
    }
    return finite.map((p) => `${PERSON_LONG[p]} (${PERSON_SHORT[p]})`).join(' ou ');
}

export function stripAccents(value: string): string {
    return value
        .normalize('NFD')
        .replace(/n\u0303/g, 'ñ')
        .replace(/N\u0303/g, 'Ñ')
        .replace(/[\u0300-\u036f]/g, '');
}

// ---------------------------------------------------------------------------
// Conjugueur
// ---------------------------------------------------------------------------

type StemChange = 'ie' | 'ue' | 'i';
type Paradigm = Partial<Record<TenseKey, string[]>>;

interface VerbDef {
    inf: string;
    stem?: StemChange;
    yo?: string;
    pret?: string;
    fut?: string;
    part?: string;
    ger?: string;
    impTu?: string;
    /** Accent écrit sur le i/u du radical (confío, actúo). */
    acc?: boolean;
    over?: Paradigm;
}

const ENDINGS = {
    ar: {
        presente: ['o', 'as', 'a', 'amos', 'áis', 'an'],
        indefinido: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
        imperfecto: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
        subj: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    },
    er: {
        presente: ['o', 'es', 'e', 'emos', 'éis', 'en'],
        indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
        imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
        subj: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    },
    ir: {
        presente: ['o', 'es', 'e', 'imos', 'ís', 'en'],
        indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
        imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
        subj: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    },
};
const FUT = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const STRONG = ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'];

function replaceLast(value: string, from: string, to: string): string {
    const i = value.lastIndexOf(from);
    return i < 0 ? value : value.slice(0, i) + to + value.slice(i + from.length);
}

function strongStem(stem: string, kind: StemChange): string {
    if (kind === 'ie') return replaceLast(stem, 'e', 'ie');
    if (kind === 'i') return replaceLast(stem, 'e', 'i');
    if (stem.startsWith('o') && !stem.slice(1).includes('o')) return `hue${stem.slice(1)}`;
    return stem.includes('o') ? replaceLast(stem, 'o', 'ue') : replaceLast(stem, 'u', 'ue');
}

function weakStem(stem: string, kind: StemChange): string {
    return kind === 'ue' ? replaceLast(stem, 'o', 'u') : replaceLast(stem, 'e', 'i');
}

/** Applique les changements orthographiques (busqué, llegué, empecé, elijo, sigo). */
function join(inf: string, stem: string, ending: string): string {
    const first = stripAccents(ending.charAt(0));
    if (/car$/.test(inf) && first === 'e') return `${stem.slice(0, -1)}qu${ending}`;
    if (/gar$/.test(inf) && first === 'e') return `${stem}u${ending}`;
    if (/zar$/.test(inf) && first === 'e') return `${stem.slice(0, -1)}c${ending}`;
    if (/guir$/.test(inf) && (first === 'a' || first === 'o')) return stem.slice(0, -1) + ending;
    if (/g(er|ir)$/.test(inf) && (first === 'a' || first === 'o')) return `${stem.slice(0, -1)}j${ending}`;
    return stem + ending;
}

function accentLast(value: string): string {
    const map: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
    for (let i = value.length - 1; i >= 0; i--) {
        if (map[value[i]]) return value.slice(0, i) + map[value[i]] + value.slice(i + 1);
    }
    return value;
}

function conjugate(def: VerbDef): Paradigm {
    const plain = stripAccents(def.inf);
    const type = plain.slice(-2) as 'ar' | 'er' | 'ir';
    const stem = plain.slice(0, -2);
    const end = ENDINGS[type];
    const vowelStem = type !== 'ar' && /[aeiou]$/.test(stem) && !/[gq]u$/.test(stem) && !def.pret;
    const accStem = def.acc ? stem.slice(0, -1) + ({ i: 'í', u: 'ú' } as Record<string, string>)[stem.slice(-1)] : stem;
    const out: Paradigm = {};

    out.presente = end.presente.map((e, p) => {
        if (p === 0 && def.yo) return def.yo;
        if (def.acc && [0, 1, 2, 5].includes(p)) return accStem + e;
        const s = def.stem && [0, 1, 2, 5].includes(p) ? strongStem(stem, def.stem) : stem;
        return join(plain, s, e);
    });

    out.subj_presente = end.subj.map((e, p) => {
        if (def.yo) return def.yo.slice(0, -1) + e;
        if (def.acc && [0, 1, 2, 5].includes(p)) return accStem + e;
        let s = stem;
        if (def.stem && [0, 1, 2, 5].includes(p)) s = strongStem(stem, def.stem);
        else if (def.stem && type === 'ir') s = weakStem(stem, def.stem);
        return join(plain, s, e);
    });

    if (def.pret) {
        out.indefinido = STRONG.map((e, p) => {
            if (p === 5 && def.pret!.endsWith('j')) return `${def.pret}eron`;
            if (p === 2 && def.pret!.endsWith('c')) return `${def.pret!.slice(0, -1)}zo`;
            return def.pret + e;
        });
    } else {
        out.indefinido = end.indefinido.map((e, p) => {
            const s = def.stem && type === 'ir' && (p === 2 || p === 5) ? weakStem(stem, def.stem) : stem;
            if (vowelStem) {
                if (p === 2) return `${s}yó`;
                if (p === 5) return `${s}yeron`;
                if (p !== 0) return s + e.replace(/^i/, 'í');
            }
            return join(plain, s, e);
        });
    }

    out.imperfecto = end.imperfecto.map((e) => stem + e);
    const futBase = def.fut ?? plain;
    out.futuro = FUT.map((e) => futBase + e);
    out.condicional = COND.map((e) => futBase + e);

    const base = out.indefinido[5].slice(0, -3);
    out.subj_imperfecto = ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'].map((e, p) =>
        (p === 3 ? accentLast(base) : base) + e);

    if (def.over) Object.assign(out, def.over);

    out.imperativo = def.over?.imperativo ?? [
        '',
        def.impTu ?? out.presente[2],
        out.subj_presente[2],
        out.subj_presente[3],
        `${plain.slice(0, -1)}d`,
        out.subj_presente[5],
    ];
    out.infinitivo = [def.inf];
    out.gerundio = [def.ger ?? (
        type === 'ar' ? `${stem}ando`
            : vowelStem ? `${stem}yendo`
                : `${def.stem && type === 'ir' ? weakStem(stem, def.stem) : stem}iendo`
    )];
    out.participio = [def.part ?? (
        type === 'ar' ? `${stem}ado` : vowelStem && !stem.endsWith('u') ? `${stem}ído` : `${stem}ido`
    )];
    return out;
}

const REGULAR = `
abrir:part=abierto acabar acostumbrar actualizar actuar:acc adaptar ahorrar alargar alcanzar alegrar
aliviar alojar alquilar apagar aportar aprender apuntar arreglar avanzar avisar ayudar bailar bajar
beber beneficiar bloquear buscar cambiar caminar cansar cantar celebrar cenar charlar cocinar comer
cometer comparar compartir compensar comprar comprender condimentar confiar:acc consultar contactar
contaminar contestar coordinar correr cortar crear creer cuidar curar deber decidir dejar depender
desayunar desconectar descansar desperdiciar discutir disfrutar duchar dudar echar enamorar encantar
encargar enfadar enseñar entrar entregar enviar:acc escribir:part=escrito escuchar esperar estropear
estudiar evitar exagerar exigir existir explicar expresar faltar fiar:acc firmar fumar funcionar ganar
gastar gritar gustar hablar imaginar importar insistir intentar interesar interrumpir invitar lavar
leer levantar limpiar llamar llegar llenar llevar llorar lograr madrugar mandar mejorar meter mirar molestar
montar mudar necesitar notar ocurrir odiar olvidar ordenar organizar pagar parar pasar pasear pegar
pelear permitir pesar pintar planear planificar practicar preguntar preocupar preparar presentar prometer
quedar quejar quitar reciclar recibir regalar relajar renunciar reparar repasar reservar respetar responder
resultar retrasar revisar robar rodear romper:part=roto saludar sacar soportar sorprender subir
sufrir surgir suspender temer terminar tirar tocar tomar trabajar tratar usar valorar vender viajar
visitar vivir votar
acostar:ue almorzar:ue aprobar:ue colgar:ue contar:ue costar:ue devolver:ue:part=devuelto
doler:ue dormir:ue encontrar:ue jugar:ue llover:ue morir:ue:part=muerto mostrar:ue mover:ue
probar:ue comprobar:ue recordar:ue resolver:ue:part=resuelto soler:ue soñar:ue volar:ue volver:ue:part=vuelto
cerrar:ie comenzar:ie convertir:ie despertar:ie divertir:ie empezar:ie entender:ie fregar:ie
invertir:ie mentir:ie negar:ie pensar:ie perder:ie preferir:ie recomendar:ie requerir:ie
sentar:ie sentir:ie sugerir:ie arrepentir:ie advertir:ie
competir:i conseguir:i corregir:i despedir:i elegir:i impedir:i medir:i pedir:i repetir:i
seguir:i servir:i vestir:i
`;

const IRREGULAR: VerbDef[] = [
    {
        inf: 'ser', part: 'sido', ger: 'siendo', over: {
            presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
            indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
            imperfecto: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
            subj_presente: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
            subj_imperfecto: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
            imperativo: ['', 'sé', 'sea', 'seamos', 'sed', 'sean'],
        },
    },
    {
        inf: 'estar', pret: 'estuv', over: {
            presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
            subj_presente: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
            imperativo: ['', 'está', 'esté', 'estemos', 'estad', 'estén'],
        },
    },
    {
        inf: 'ir', ger: 'yendo', part: 'ido', over: {
            presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
            indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
            imperfecto: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
            subj_presente: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
            subj_imperfecto: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
            imperativo: ['', 've', 'vaya', 'vamos', 'id', 'vayan'],
        },
    },
    {
        inf: 'haber', pret: 'hub', fut: 'habr', over: {
            presente: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
            subj_presente: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
        },
    },
    { inf: 'tener', stem: 'ie', yo: 'tengo', pret: 'tuv', fut: 'tendr', impTu: 'ten' },
    { inf: 'mantener', stem: 'ie', yo: 'mantengo', pret: 'mantuv', fut: 'mantendr', impTu: 'mantén' },
    { inf: 'obtener', stem: 'ie', yo: 'obtengo', pret: 'obtuv', fut: 'obtendr', impTu: 'obtén' },
    { inf: 'hacer', yo: 'hago', pret: 'hic', fut: 'har', part: 'hecho', impTu: 'haz' },
    { inf: 'deshacer', yo: 'deshago', pret: 'deshic', fut: 'deshar', part: 'deshecho', impTu: 'deshaz' },
    { inf: 'poder', stem: 'ue', pret: 'pud', fut: 'podr', ger: 'pudiendo' },
    { inf: 'querer', stem: 'ie', pret: 'quis', fut: 'querr' },
    { inf: 'decir', stem: 'i', yo: 'digo', pret: 'dij', fut: 'dir', part: 'dicho', impTu: 'di' },
    { inf: 'venir', stem: 'ie', yo: 'vengo', pret: 'vin', fut: 'vendr', impTu: 'ven' },
    { inf: 'convenir', stem: 'ie', yo: 'convengo', pret: 'convin', fut: 'convendr', impTu: 'convén' },
    { inf: 'prevenir', stem: 'ie', yo: 'prevengo', pret: 'previn', fut: 'prevendr', impTu: 'prevén' },
    { inf: 'poner', yo: 'pongo', pret: 'pus', fut: 'pondr', part: 'puesto', impTu: 'pon' },
    { inf: 'proponer', yo: 'propongo', pret: 'propus', fut: 'propondr', part: 'propuesto', impTu: 'propón' },
    { inf: 'suponer', yo: 'supongo', pret: 'supus', fut: 'supondr', part: 'supuesto', impTu: 'supón' },
    { inf: 'salir', yo: 'salgo', fut: 'saldr', impTu: 'sal' },
    { inf: 'valer', yo: 'valgo', fut: 'valdr' },
    {
        inf: 'saber', pret: 'sup', fut: 'sabr', over: {
            subj_presente: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
        },
    },
    {
        inf: 'dar', over: {
            presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
            indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
            subj_presente: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
            subj_imperfecto: ['diera', 'dieras', 'diera', 'diéramos', 'dierais', 'dieran'],
        },
    },
    {
        inf: 'ver', part: 'visto', over: {
            presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
            indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
            imperfecto: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
            subj_presente: ['vea', 'veas', 'vea', 'veamos', 'veáis', 'vean'],
            subj_imperfecto: ['viera', 'vieras', 'viera', 'viéramos', 'vierais', 'vieran'],
        },
    },
    { inf: 'traer', yo: 'traigo', pret: 'traj', part: 'traído', ger: 'trayendo' },
    { inf: 'caer', yo: 'caigo' },
    { inf: 'reducir', yo: 'reduzco', pret: 'reduj' },
    { inf: 'conducir', yo: 'conduzco', pret: 'conduj' },
    { inf: 'producir', yo: 'produzco', pret: 'produj' },
    { inf: 'traducir', yo: 'traduzco', pret: 'traduj' },
    { inf: 'conocer', yo: 'conozco' },
    { inf: 'parecer', yo: 'parezco' },
    { inf: 'merecer', yo: 'merezco' },
    { inf: 'nacer', yo: 'nazco' },
    { inf: 'crecer', yo: 'crezco' },
    { inf: 'ofrecer', yo: 'ofrezco' },
    { inf: 'agradecer', yo: 'agradezco' },
    { inf: 'apetecer', yo: 'apetezco' },
    { inf: 'amanecer', yo: 'amanezco' },
    { inf: 'desaparecer', yo: 'desaparezco' },
    { inf: 'convencer', yo: 'convenzo' },
    {
        inf: 'oler', over: {
            presente: ['huelo', 'hueles', 'huele', 'olemos', 'oléis', 'huelen'],
            subj_presente: ['huela', 'huelas', 'huela', 'olamos', 'oláis', 'huelan'],
        },
    },
    {
        inf: 'reír', ger: 'riendo', part: 'reído', over: {
            presente: ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'],
            indefinido: ['reí', 'reíste', 'rio', 'reímos', 'reísteis', 'rieron'],
            subj_presente: ['ría', 'rías', 'ría', 'riamos', 'riais', 'rían'],
        },
    },
];

function parseRegular(): VerbDef[] {
    return REGULAR.trim().split(/\s+/).map((spec) => {
        const [inf, ...opts] = spec.split(':');
        const def: VerbDef = { inf };
        for (const opt of opts) {
            if (opt === 'ie' || opt === 'ue' || opt === 'i') def.stem = opt;
            else if (opt === 'acc') def.acc = true;
            else if (opt.startsWith('part=')) def.part = opt.slice(5);
        }
        return def;
    });
}

let exactIndex: Map<string, FormEntry[]> | null = null;
let looseIndex: Map<string, FormEntry[]> | null = null;

function addForm(map: Map<string, FormEntry[]>, form: string, entry: FormEntry): void {
    const list = map.get(form) ?? [];
    if (!list.some((e) => e.infinitive === entry.infinitive && e.tense === entry.tense && e.person === entry.person)) {
        list.push(entry);
    }
    map.set(form, list);
}

function buildIndex(): void {
    exactIndex = new Map();
    looseIndex = new Map();
    for (const def of [...parseRegular(), ...IRREGULAR]) {
        const paradigm = conjugate(def);
        for (const [tense, forms] of Object.entries(paradigm) as Array<[TenseKey, string[]]>) {
            forms.forEach((form, index) => {
                if (!form) return;
                const nonFinite = tense === 'infinitivo' || tense === 'gerundio' || tense === 'participio';
                const entry: FormEntry = { infinitive: def.inf, tense, person: nonFinite ? -1 : index };
                addForm(exactIndex!, form, entry);
                addForm(looseIndex!, stripAccents(form), entry);
            });
        }
    }
    const hay: FormEntry = { infinitive: 'haber', tense: 'presente', person: 6 };
    addForm(exactIndex, 'hay', hay);
    addForm(looseIndex, 'hay', hay);
}

const CLITICS = ['selo', 'sela', 'selos', 'selas', 'melo', 'mela', 'telo', 'nos', 'los', 'las', 'les', 'lo', 'la', 'le', 'me', 'te', 'se'];

/**
 * Cherche une forme verbale. `strict` exige les accents exacts (utile pour la
 * phrase de référence, où « esta » ne doit pas être confondu avec « está »).
 */
export function lookupVerbForm(raw: string, strict = false): { entries: FormEntry[]; clitic: string } {
    if (!exactIndex || !looseIndex) buildIndex();
    const form = raw.toLocaleLowerCase('es');
    const direct = exactIndex!.get(form) ?? (strict ? undefined : looseIndex!.get(stripAccents(form)));
    if (direct?.length) return { entries: direct, clitic: '' };

    for (const suffix of CLITICS) {
        if (form.length <= suffix.length + 2 || !form.endsWith(suffix)) continue;
        const base = stripAccents(form.slice(0, -suffix.length));
        let entries = (looseIndex!.get(base) ?? []).filter(
            (e) => e.tense === 'infinitivo' || e.tense === 'gerundio' || e.tense === 'imperativo',
        );
        // « piénsalo » : l'impératif avec pronom porte un accent écrit.
        if (strict) entries = entries.filter((e) => e.tense !== 'imperativo' || form !== stripAccents(form));
        if (entries.length) return { entries, clitic: suffix };
        // Deux pronoms : « comprármelo », « dímelo ».
        for (const second of ['me', 'te', 'se', 'nos']) {
            if (!base.endsWith(second)) continue;
            const inner = (looseIndex!.get(base.slice(0, -second.length)) ?? []).filter(
                (e) => e.tense === 'infinitivo' || e.tense === 'gerundio' || e.tense === 'imperativo',
            );
            if (inner.length) return { entries: inner, clitic: second + suffix };
        }
    }
    return { entries: [], clitic: '' };
}

/** Génère la forme d'un verbe à un temps et une personne donnés. */
export function conjugateForm(infinitive: string, tense: TenseKey, person: number): string | null {
    const def = [...IRREGULAR, ...parseRegular()].find((d) => d.inf === infinitive);
    if (!def) return null;
    const forms = conjugate(def)[tense];
    if (!forms) return null;
    return forms[person < 0 ? 0 : person] || null;
}

/** Forme « régularisée » (sans irrégularité ni changement de radical) : sert à repérer les erreurs typiques. */
export function regularizedForm(infinitive: string, tense: TenseKey, person: number): string | null {
    const plain = stripAccents(infinitive);
    if (!/(ar|er|ir)$/.test(plain)) return null;
    const forms = conjugate({ inf: plain })[tense];
    return forms?.[person < 0 ? 0 : person] || null;
}

export function stemChangeOf(infinitive: string): StemChange | null {
    return parseRegular().find((d) => d.inf === infinitive)?.stem
        ?? IRREGULAR.find((d) => d.inf === infinitive)?.stem
        ?? null;
}

export function isIrregular(infinitive: string): boolean {
    return IRREGULAR.some((d) => d.inf === infinitive);
}

// ---------------------------------------------------------------------------
// Analyse en contexte
// ---------------------------------------------------------------------------

const DETERMINERS = new Set([
    'el', 'un', 'unos', 'unas', 'una', 'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra',
    'nuestros', 'nuestras', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel',
    'aquella', 'mucho', 'mucha', 'muchos', 'muchas', 'poco', 'poca', 'pocos', 'pocas', 'cada', 'otro',
    'otra', 'otros', 'otras', 'mismo', 'misma', 'buen', 'buena', 'mal', 'mala', 'primer', 'primera',
    'demasiado', 'demasiada', 'algún', 'alguna', 'ningún', 'ninguna', 'tanto', 'tanta', 'del', 'al',
]);
const PREPOSITIONS = new Set([
    'de', 'a', 'en', 'con', 'por', 'para', 'sin', 'entre', 'sobre', 'hasta', 'desde', 'hacia', 'tras',
]);
const NON_VERBS = new Set(['como', 'entre', 'sobre', 'para', 'nada', 'casa', 'vino', 'sal', 'mejores', 'amanecer']);
/** Lectures dispréférées quand une autre lecture existe (« creo » = creer, « siento » = sentir). */
const DISPREFERRED = new Set(['crear', 'sentar']);
/** Mots qui, après le mot indiqué, forment une locution et non un verbe. */
const LOCUTIONS: Record<string, string[]> = {
    falta: ['hace', 'hacía', 'hizo', 'hará', 'haga', 'sin'],
    cuenta: ['di', 'dio', 'dar', 'doy', 'das', 'da', 'dé', 'diste', 'dimos', 'dieron', 'en', 'darme', 'darte', 'darse', 'darnos', 'de'],
    pesar: ['a'],
    hecho: ['de', 'el', 'un'],
    sentido: ['tiene', 'tener', 'sin', 'el', 'un', 'mucho', 'buen'],
    pasado: ['año', 'mes', 'verano', 'fin', 'el', 'lo'],
    pasada: ['semana', 'vez', 'la'],
};

const REFLEXIVE_PRONOUNS = ['me', 'te', 'se', 'nos', 'os'];
const REFLEXIVE_VERBS = new Set([
    'acostar', 'levantar', 'duchar', 'mudar', 'quedar', 'quejar', 'enfadar', 'arrepentir', 'preocupar',
    'olvidar', 'apuntar', 'adaptar', 'alojar', 'sentir', 'despertar', 'relajar', 'acostumbrar', 'ir',
    'dormir', 'enamorar', 'divertir', 'despedir', 'vestir', 'sentar', 'equivocar', 'reír', 'parecer', 'rodear',
]);

export function tokenizeSentence(sentence: string): string[] {
    return sentence
        .toLocaleLowerCase('es')
        .replace(/[¿¡]/g, ' ')
        .replace(/[’']/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function isNonFinite(e: FormEntry): boolean {
    return e.tense === 'infinitivo' || e.tense === 'gerundio' || e.tense === 'participio';
}

/** Élimine les lectures verbales improbables (noms, locutions). */
function verbReadings(tokens: string[], i: number, strict: boolean): { entries: FormEntry[]; clitic: string } {
    const token = tokens[i];
    const prev = tokens[i - 1] ?? '';
    if (NON_VERBS.has(token)) return { entries: [], clitic: '' };
    if (LOCUTIONS[token]?.includes(prev)) return { entries: [], clitic: '' };
    const found = lookupVerbForm(token, strict);
    let entries = found.entries;
    const pp = tokens[i - 2] ?? '';
    if (DETERMINERS.has(prev) && !(prev === 'poco' && pp === 'a')) entries = entries.filter((e) => e.tense === 'infinitivo' && prev === 'el');
    if (PREPOSITIONS.has(prev) && !(prev === 'a' && pp === 'poco')) entries = entries.filter((e) => isNonFinite(e));
    if (['muy', 'tan', 'bastante'].includes(prev)) entries = [];
    if (['la', 'las', 'los'].includes(prev) && /as?$/.test(token)) {
        entries = entries.filter((e) => isNonFinite(e));
    }
    return { entries, clitic: found.clitic };
}

const PAST_MARKERS = [
    'ayer', 'anoche', 'anteayer', 'el año pasado', 'la semana pasada', 'el mes pasado', 'el verano pasado',
    'el otro día', 'aquel día', 'aquella vez', 'una vez', 'de repente', 'la primera vez', 'el lunes',
    'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado', 'el domingo', 'en cuanto llegué',
];
const IMPERFECT_MARKERS = [
    'cuando era', 'cuando éramos', 'de pequeño', 'de pequeña', 'de niño', 'de niña', 'de joven', 'antes',
    'siempre', 'todos los', 'todas las', 'cada', 'a menudo', 'normalmente', 'mientras', 'de vez en cuando',
    'por aquel entonces', 'en aquella época', 'en esa época',
];
const PERFECT_MARKERS = [
    'hoy', 'esta mañana', 'esta semana', 'este mes', 'este año', 'este verano', 'ya', 'todavía', 'aún',
    'nunca', 'alguna vez', 'últimamente', 'recién', 'hasta ahora', 'en mi vida', 'jamás', 'muchas veces',
];
const FUTURE_MARKERS = [
    'mañana', 'pronto', 'el próximo', 'la próxima', 'los próximos', 'las próximas', 'que viene',
    'dentro de', 'algún día', 'en el futuro', 'más adelante', 'esta noche', 'este fin de semana',
];
const HABIT_MARKERS = [
    'siempre', 'todos los días', 'todas las mañanas', 'normalmente', 'cada', 'a menudo', 'a veces',
    'nunca', 'los fines de semana', 'por las mañanas', 'de vez en cuando', 'casi nunca',
];

function findMarker(sentence: string, markers: string[]): string | null {
    const text = ` ${sentence} `;
    const marker = markers.find((m) => text.includes(` ${m} `));
    if (marker) return marker;
    const year = sentence.match(/\ben (19|20)\d\d\b/);
    if (year && markers === PAST_MARKERS) return year[0];
    const ago = sentence.match(/\bhace (un|una|unos|unas|dos|tres|cuatro|cinco|seis|diez|\d+|mucho|poco) ?(año|años|mes|meses|día|días|semana|semanas|tiempo|rato)?\b/);
    if (ago && markers === PAST_MARKERS && !sentence.includes('desde hace')) return ago[0].trim();
    return null;
}

const WISH = new Set(['querer', 'esperar', 'preferir', 'pedir', 'necesitar', 'desear', 'recomendar', 'aconsejar', 'sugerir', 'dejar', 'permitir', 'prohibir', 'exigir', 'mandar', 'ordenar', 'insistir', 'conseguir', 'lograr', 'evitar', 'impedir']);
const EMOTION = new Set(['alegrar', 'molestar', 'preocupar', 'encantar', 'gustar', 'sorprender', 'importar', 'doler', 'enfadar', 'odiar', 'temer', 'sentir', 'dar', 'fastidiar', 'agradecer', 'apetecer']);
const DOUBT = new Set(['dudar', 'negar']);
const OPINION = new Set(['creer', 'pensar', 'parecer', 'estar', 'imaginar', 'opinar']);
const IMPERSONAL = new Set(['importante', 'necesario', 'posible', 'imposible', 'probable', 'improbable', 'mejor', 'peor', 'fundamental', 'recomendable', 'normal', 'conveniente', 'lógico', 'raro', 'natural', 'increíble', 'injusto', 'justo', 'pena', 'lástima', 'hora', 'urgente', 'esencial', 'preferible', 'suficiente', 'fácil', 'difícil', 'interesante', 'bueno', 'malo', 'útil', 'vale', 'conviene', 'falta', 'basta']);

interface Trigger {
    kind: 'ojala' | 'maybe' | 'si' | 'comosi' | 'time' | 'concession' | 'purpose' | 'condition' | 'wish' | 'emotion' | 'doubt' | 'impersonal' | 'que' | 'negImperative';
    label: string;
    triggerTense?: TenseKey;
}

function finiteReading(token: string): FormEntry | null {
    if (NON_VERBS.has(token)) return null;
    const entries = lookupVerbForm(token, true).entries.filter((e) => !isNonFinite(e));
    return entries.find((e) => !DISPREFERRED.has(e.infinitive)) ?? entries[0] ?? null;
}

function findTrigger(tokens: string[], idx: number): Trigger | null {
    const start = Math.max(0, idx - 10);
    for (let j = idx - 1; j >= start; j--) {
        const t = tokens[j];
        if (t === 'ojalá') return { kind: 'ojala', label: 'ojalá' };
        if (t === 'quizás' || t === 'quizá') return { kind: 'maybe', label: t };
        if (t === 'vez' && tokens[j - 1] === 'tal') return { kind: 'maybe', label: 'tal vez' };
        if (t === 'si') return tokens[j - 1] === 'como' ? { kind: 'comosi', label: 'como si' } : { kind: 'si', label: 'si' };
        if (t === 'cuando' || t === 'mientras') return { kind: 'time', label: t };
        if (t === 'cuanto' && tokens[j - 1] === 'en') return { kind: 'time', label: 'en cuanto' };
        if (t === 'cuanto' && ['antes', 'más', 'menos'].includes(tokens[j + 1] ?? '')) {
            return { kind: 'time', label: `cuanto ${tokens[j + 1]}` };
        }
        if (t === 'aunque') return { kind: 'concession', label: 'aunque' };
        if (t !== 'que') continue;

        const p1 = tokens[j - 1] ?? '';
        const p2 = tokens[j - 2] ?? '';
        if ((p1 === 'mucho' || p1 === 'más') && p2 === 'por') return { kind: 'concession', label: `por ${p1} que` };
        if (p1 === 'para') return { kind: 'purpose', label: 'para que' };
        if (p1 === 'sin') return { kind: 'purpose', label: 'sin que' };
        if (p1 === 'de' && p2 === 'antes') return { kind: 'time', label: 'antes de que' };
        if (p1 === 'de' && p2 === 'después') return { kind: 'time', label: 'después de que' };
        if (p1 === 'hasta') return { kind: 'time', label: 'hasta que' };
        if (p1 === 'menos' && p2 === 'a') return { kind: 'condition', label: 'a menos que' };
        if (p1 === 'siempre') return { kind: 'condition', label: 'siempre que' };
        if (p1 === 'de' && p2 === 'tal') return { kind: 'condition', label: 'con tal de que' };

        for (let k = 1; k <= 3 && j - k >= 0; k++) {
            const w = tokens[j - k];
            if (IMPERSONAL.has(w)) {
                const from = Math.max(0, j - k - 2);
                return { kind: 'impersonal', label: tokens.slice(from, j + 1).join(' ') };
            }
            const reading = finiteReading(w);
            if (!reading) continue;
            const negated = tokens.slice(Math.max(0, j - k - 3), j - k).includes('no');
            const from = j - k - (REFLEXIVE_PRONOUNS.includes(tokens[j - k - 1] ?? '') || tokens[j - k - 1] === 'le' ? 1 : 0);
            const label = `${negated ? 'no ' : ''}${tokens.slice(from, j + 1).join(' ')}`;
            if (WISH.has(reading.infinitive)) return { kind: 'wish', label, triggerTense: reading.tense };
            if (EMOTION.has(reading.infinitive)) return { kind: 'emotion', label, triggerTense: reading.tense };
            if (DOUBT.has(reading.infinitive) || (OPINION.has(reading.infinitive) && negated)) {
                return { kind: 'doubt', label, triggerTense: reading.tense };
            }
            return { kind: 'que', label: tokens.slice(j - k, j + 1).join(' '), triggerTense: reading.tense };
        }
        return { kind: 'que', label: 'que' };
    }
    return null;
}

const MODALS: Record<string, string> = {
    poder: 'Après « poder » (pouvoir), le verbe suivant reste à l’infinitif, comme en français.',
    querer: 'Après « querer » (vouloir), le verbe suivant reste à l’infinitif quand le sujet est le même.',
    deber: 'Après « deber » (devoir), le verbe suivant reste à l’infinitif.',
    saber: 'Après « saber » (savoir faire), le verbe suivant reste à l’infinitif.',
    soler: '« soler + infinitif » exprime une habitude (avoir l’habitude de).',
    necesitar: 'Après « necesitar », le verbe suivant reste à l’infinitif quand le sujet est le même.',
    preferir: 'Après « preferir », le verbe suivant reste à l’infinitif quand le sujet est le même.',
    intentar: 'Après « intentar » (essayer de), le verbe suivant reste à l’infinitif.',
    esperar: 'Après « esperar » avec le même sujet, on garde l’infinitif (sans « que »).',
    decidir: 'Après « decidir », le verbe suivant reste à l’infinitif.',
    gustar: 'Après « gustar / encantar / apetecer », l’action aimée s’exprime à l’infinitif.',
    encantar: 'Après « gustar / encantar / apetecer », l’action aimée s’exprime à l’infinitif.',
    apetecer: 'Après « apetecer » (avoir envie de), l’action s’exprime à l’infinitif.',
    pensar: '« pensar + infinitif » signifie « avoir l’intention de ».',
    conseguir: 'Après « conseguir » (réussir à), le verbe suivant reste à l’infinitif.',
    lograr: 'Après « lograr » (réussir à), le verbe suivant reste à l’infinitif.',
    odiar: 'Après un verbe de goût comme « odiar », l’action s’exprime à l’infinitif.',
    prometer: 'Après « prometer », le verbe suivant reste à l’infinitif quand le sujet est le même.',
};

const PERIPHRASES: Array<[string, string, string]> = [
    ['ir', 'a', '« ir a + infinitif » est le futur proche (aller + infinitif).'],
    ['acabar', 'de', '« acabar de + infinitif » exprime un passé immédiat (venir de).'],
    ['tener', 'que', '« tener que + infinitif » exprime une obligation personnelle (devoir).'],
    ['haber', 'que', '« hay que + infinitif » exprime une obligation générale (il faut).'],
    ['volver', 'a', '« volver a + infinitif » exprime la répétition (refaire, … à nouveau).'],
    ['dejar', 'de', '« dejar de + infinitif » signifie arrêter de.'],
    ['empezar', 'a', '« empezar a + infinitif » signifie commencer à.'],
    ['comenzar', 'a', '« comenzar a + infinitif » signifie commencer à.'],
    ['aprender', 'a', '« aprender a + infinitif » signifie apprendre à.'],
    ['ayudar', 'a', '« ayudar a + infinitif » signifie aider à.'],
    ['tratar', 'de', '« tratar de + infinitif » signifie essayer de.'],
    ['acordar', 'de', '« acordarse de + infinitif » signifie penser à / se souvenir de.'],
    ['olvidar', 'de', '« olvidarse de + infinitif » signifie oublier de.'],
    ['quedar', 'en', '« quedar en + infinitif » signifie convenir de.'],
];

const GUSTAR_LIKE = new Set(['gustar', 'encantar', 'molestar', 'preocupar', 'importar', 'doler', 'apetecer', 'sorprender', 'alegrar', 'interesar', 'fastidiar', 'faltar', 'quedar', 'parecer', 'costar', 'convenir', 'merecer']);

function explainSubjunctive(trigger: Trigger | null, tense: TenseKey): string {
    const imperfect = tense === 'subj_imperfecto' || tense === 'subj_pluscuamperfecto';
    if (!trigger) {
        return 'Le subjonctif est requis ici : le verbe dépend d’une expression de souhait, de sentiment, de doute ou d’une action pas encore réalisée.';
    }
    const concordance = imperfect && trigger.triggerTense
        && ['indefinido', 'imperfecto', 'condicional', 'pluscuamperfecto'].includes(trigger.triggerTense)
        ? ` Le verbe principal est au ${TENSE_LABELS[trigger.triggerTense]}, donc la subordonnée passe au subjonctif imparfait (concordance des temps).`
        : '';
    switch (trigger.kind) {
        case 'ojala':
            return imperfect
                ? 'Après « ojalá », le subjonctif imparfait exprime un souhait peu probable ou irréel.'
                : 'Après « ojalá » (pourvu que / j’espère que), on emploie toujours le subjonctif.';
        case 'maybe':
            return `Après « ${trigger.label} » (peut-être), le subjonctif marque le doute.`;
        case 'si':
            return 'Hypothèse irréelle ou peu probable : « si + subjonctif imparfait » (le français dit « si + imparfait »), avec le conditionnel dans la principale.';
        case 'comosi':
            return '« como si » (comme si) est toujours suivi du subjonctif imparfait.';
        case 'time':
            return imperfect
                ? `Après « ${trigger.label} », l’action était encore à venir par rapport au passé : subjonctif imparfait.`
                : `Après « ${trigger.label} » suivi d’une action future, l’espagnol emploie le subjonctif présent — là où le français met le futur (« quand tu viendras » → « cuando vengas »).`;
        case 'concession':
            return `« ${trigger.label} » + subjonctif présente la concession comme hypothétique ou sans importance (même si… / avoir beau…). Avec un fait certain, on mettrait l’indicatif.`;
        case 'purpose':
            return `« ${trigger.label} » exprime un but ou une circonstance non réalisée : il est toujours suivi du subjonctif.${concordance}`;
        case 'condition':
            return `« ${trigger.label} » introduit une condition : il est toujours suivi du subjonctif.${concordance}`;
        case 'wish':
            return `Après un verbe de volonté ou de demande (« ${trigger.label} ») avec un sujet différent, on emploie le subjonctif.${concordance}`;
        case 'emotion':
            return `Après une expression de sentiment (« ${trigger.label} »), la subordonnée se met au subjonctif.${concordance}`;
        case 'doubt':
            return `Après une expression de doute ou une opinion niée (« ${trigger.label} »), on emploie le subjonctif.${concordance}`;
        case 'impersonal':
            return `Après une expression impersonnelle de jugement (« ${trigger.label} »), la subordonnée se met au subjonctif.${concordance}`;
        case 'negImperative':
            return 'Impératif négatif : en espagnol, on utilise toujours le subjonctif présent après « no » pour donner un ordre ou un conseil négatif.';
        default:
            return `La subordonnée introduite par « ${trigger.label} » exprime une action non réalisée, voulue ou hypothétique : d’où le subjonctif.${concordance}`;
    }
}

function explain(tokens: string[], idx: number, span: number, entry: FormEntry, clitic: string): string {
    const sentence = tokens.join(' ');
    const prev = tokens[idx - 1] ?? '';
    const prevReading = prev && !NON_VERBS.has(prev) ? finiteReading(prev) ?? lookupVerbForm(prev, true).entries[0] : undefined;
    const notes: string[] = [];
    const tense = entry.tense;

    const dativeBefore = [tokens[idx - 1], tokens[idx - 2]].some((t) => ['me', 'te', 'le', 'nos', 'os', 'les'].includes(t ?? ''));
    if (GUSTAR_LIKE.has(entry.infinitive) && !isNonFinite(entry) && entry.person !== 6 && [2, 5].includes(entry.person) && dativeBefore) {
        notes.push(`Verbe de type « gustar » : il s’accorde avec la chose qui plaît / gêne (le sujet grammatical), pas avec la personne (me, te, le…).`);
    }

    switch (tense) {
        case 'subj_presente':
        case 'subj_imperfecto':
        case 'subj_perfecto':
        case 'subj_pluscuamperfecto': {
            if (tense === 'subj_presente' && (prev === 'no' || (REFLEXIVE_PRONOUNS.includes(prev) && tokens[idx - 2] === 'no')) && entry.person === 1) {
                return explainSubjunctive({ kind: 'negImperative', label: 'no' }, tense);
            }
            const base = explainSubjunctive(findTrigger(tokens, idx), tense);
            return tense === 'subj_perfecto'
                ? `${base} Le subjonctif passé (haya + participe) indique que l’action sera déjà accomplie.`
                : tense === 'subj_pluscuamperfecto'
                    ? `${base} Au plus-que-parfait (hubiera + participe), l’hypothèse porte sur le passé : elle ne s’est pas réalisée.`
                    : [base, ...notes].join(' ');
        }
        case 'condicional': {
            if (tokens.includes('si')) return ['Conséquence d’une hypothèse introduite par « si » : comme en français, la principale est au conditionnel.', ...notes].join(' ');
            if (['gustar', 'encantar', 'poder', 'deber', 'querer', 'preferir', 'importar'].includes(entry.infinitive)) {
                return [`Le conditionnel de « ${entry.infinitive} » adoucit la demande ou le conseil (politesse), comme « j’aimerais / je pourrais / tu devrais ».`, ...notes].join(' ');
            }
            return ['Le conditionnel exprime une action hypothétique, un souhait ou un futur vu du passé, comme en français.', ...notes].join(' ');
        }
        case 'futuro': {
            const marker = findMarker(sentence, FUTURE_MARKERS);
            if (tokens.includes('si') && tokens.indexOf('si') < idx) return 'Condition réelle : « si + présent » dans la subordonnée, futur dans la principale (comme en français).';
            return marker
                ? `Action à venir, annoncée par « ${marker} » : futur simple.`
                : 'Action à venir ou prévision : futur simple. (À l’oral, on dit aussi souvent « ir a + infinitif ».)';
        }
        case 'indefinido': {
            const marker = findMarker(sentence, PAST_MARKERS);
            return [marker
                ? `Action ponctuelle et terminée, située dans un passé révolu par « ${marker} » : pretérito indefinido (le français utilise ici le passé composé).`
                : 'Action achevée à un moment précis du passé, sans lien avec le présent : pretérito indefinido (passé composé ou passé simple en français).', ...notes].join(' ');
        }
        case 'imperfecto': {
            if (tokens.includes('si') && tokens.indexOf('si') < idx && entry.infinitive !== 'haber') {
                return 'Attention : après « si » d’hypothèse, l’espagnol n’utilise pas l’imparfait de l’indicatif mais le subjonctif imparfait.';
            }
            const marker = findMarker(sentence, IMPERFECT_MARKERS);
            if (marker === 'mientras') return 'Action en cours (arrière-plan) au moment où autre chose se passe, introduite par « mientras » : imparfait.';
            return [marker
                ? `Habitude ou description dans le passé (« ${marker} ») : imparfait, comme en français.`
                : 'Description, état ou habitude dans le passé (sans début ni fin précis) : imparfait, comme en français.', ...notes].join(' ');
        }
        case 'perfecto': {
            const marker = findMarker(sentence, PERFECT_MARKERS);
            return marker
                ? `Passé récent ou relié au présent (« ${marker} ») : pretérito perfecto = haber au présent + participe passé (toujours invariable).`
                : 'Action passée dont le résultat compte encore aujourd’hui : pretérito perfecto = haber au présent + participe passé (toujours invariable).';
        }
        case 'pluscuamperfecto':
            return 'Action antérieure à une autre action passée : haber à l’imparfait + participe passé (plus-que-parfait).';
        case 'futuro_perfecto':
            return 'Action qui sera terminée à un moment futur (ou supposition sur le passé) : haber au futur + participe.';
        case 'condicional_perfecto':
            return 'Conséquence irréelle dans le passé (« j’aurais… ») : haber au conditionnel + participe.';
        case 'infinitivo_compuesto':
            return 'Infinitif passé (haber + participe) : l’action est antérieure à celle du verbe principal.';
        case 'presente': {
            if (entry.person === 6) return '« hay » (forme impersonnelle de haber) = il y a ; il ne s’accorde jamais.';
            if (sentence.includes('desde hace')) return 'Action commencée dans le passé et qui dure encore (« desde hace ») : l’espagnol emploie le présent, comme le français.';
            if (entry.infinitive === 'llevar' && /\b(año|años|mes|meses|día|días|semana|semanas|horas|tiempo)\b/.test(sentence)) {
                return '« llevar + durée (+ gérondif) » exprime depuis combien de temps dure une action : on le met au présent (« llevo dos años… » = ça fait deux ans que…).';
            }
            if (tokens.includes('si') && tokens.indexOf('si') === idx - 1 - (REFLEXIVE_PRONOUNS.includes(prev) ? 1 : 0)) {
                return 'Condition réelle ou possible : « si + présent de l’indicatif » (jamais de futur ni de subjonctif présent après « si »).';
            }
            const marker = findMarker(sentence, HABIT_MARKERS);
            return [marker
                ? `Habitude ou fait répété (« ${marker} ») : présent de l’indicatif.`
                : 'Fait actuel, vérité générale ou habitude : présent de l’indicatif.', ...notes].join(' ');
        }
        case 'imperativo':
            return `Ordre, conseil ou invitation adressé directement à quelqu’un : impératif.${clitic ? ` À l’affirmatif, le pronom « ${clitic} » se colle à la fin du verbe (et un accent écrit apparaît souvent).` : ''}`;
        case 'gerundio': {
            for (let j = idx - 1; j >= Math.max(0, idx - 5); j--) {
                const all = NON_VERBS.has(tokens[j]) ? [] : lookupVerbForm(tokens[j], true).entries.filter((e) => !isNonFinite(e));
                if (!all.length) continue;
                const has = (v: string) => all.some((e) => e.infinitive === v);
                if (has('estar')) return '« estar + gérondif » décrit une action en cours (être en train de).';
                if (has('llevar')) return '« llevar + durée + gérondif » indique depuis combien de temps on fait quelque chose (ça fait… que je…).';
                if (has('seguir')) return '« seguir + gérondif » signifie continuer à faire / toujours faire.';
                if (has('ir')) return '« ir + gérondif » exprime une progression (peu à peu).';
                if (has('pasar')) return '« pasar + durée + gérondif » = passer du temps à faire quelque chose.';
                break;
            }
            return 'Le gérondif exprime la manière ou une action simultanée (« en + participe présent » en français).';
        }
        case 'infinitivo': {
            if (span === 2) return 'Infinitif passé (haber + participe).';
            const p2 = tokens[idx - 2] ?? '';
            for (const [verb, prep, text] of PERIPHRASES) {
                if (prev !== prep) continue;
                const r = lookupVerbForm(p2, true).entries[0] ?? lookupVerbForm(tokens[idx - 3] ?? '', true).entries[0];
                if (r?.infinitive === verb || (verb === 'haber' && p2 === 'hay')) return text;
            }
            if (['para', 'sin', 'de', 'a', 'por', 'al', 'en', 'tras'].includes(prev)) {
                const reason = prev === 'para' ? ' (but)' : prev === 'sin' ? ' (sans)' : prev === 'al' ? ' (au moment où)' : '';
                return `Après la préposition « ${prev} »${reason}, l’espagnol emploie toujours l’infinitif.`;
            }
            if (prevReading && MODALS[prevReading.infinitive]) return MODALS[prevReading.infinitive];
            if (prevReading && !isNonFinite(prevReading)) return `Après le verbe « ${prevReading.infinitive} », le second verbe reste à l’infinitif (même sujet).`;
            if (idx === 0) return 'Infinitif employé comme sujet ou comme nom (le fait de…).';
            return 'Le verbe est à l’infinitif : il dépend d’un autre verbe ou d’une préposition.';
        }
        case 'participio':
            return 'Participe passé employé comme adjectif : il s’accorde en genre et en nombre.';
        default:
            return '';
    }
}

/** Choisit la lecture la plus plausible d'une forme ambiguë dans son contexte. */
function chooseReading(tokens: string[], idx: number, entries: FormEntry[], clitic: string, prefer?: FormEntry): FormEntry[] {
    const sentence = tokens.join(' ');
    const next = tokens[idx + 1] ?? '';
    const pastVerbElsewhere = tokens.some((t, j) => j !== idx && lookupVerbForm(t, true).entries.length > 0
        && lookupVerbForm(t, true).entries.every((e) => ['imperfecto', 'pluscuamperfecto'].includes(e.tense)
            || (e.tense === 'indefinido' && e.person !== 3)));
    const pastContext = Boolean(findMarker(sentence, PAST_MARKERS)) || pastVerbElsewhere
        || /\bdesde que\b/.test(tokens.slice(Math.max(0, idx - 2), idx).join(' '));
    const clauseStart = idx === 0 || ['y', 'pero', 'no'].includes(tokens[idx - 1] ?? '');
    const fixedExpression = next === 'de' || (next === 'la' && tokens[idx + 2] === 'pena');

    const score = (e: FormEntry): number => {
        let s = 0;
        if (prefer) {
            if (e.infinitive === prefer.infinitive) s += 4;
            if (e.tense === prefer.tense) s += 2;
            if (e.person === prefer.person) s += 1;
        }
        if (DISPREFERRED.has(e.infinitive)) s -= 1;
        if (e.tense === 'imperativo') s += clitic || (clauseStart && idx === 0 && !fixedExpression) ? 2 : -3;
        if (e.tense === 'indefinido' && e.person === 3) s += pastContext ? 1 : -1;
        if (e.infinitive === 'ir' && (['a', 'al', 'hasta'].includes(next) || /(ando|iendo|yendo)$/.test(next))) s += 1;
        if (e.infinitive === 'ser' && !['a', 'al', 'hasta'].includes(next)) s += 0.5;
        if (e.infinitive === 'saber') s += 0.5;
        if (e.tense === 'participio') s -= 0.5;
        return s;
    };
    const best = [...entries].sort((a, b) => score(b) - score(a))[0];
    if (!best) return [];
    return entries.filter((e) => e.infinitive === best.infinitive && e.tense === best.tense);
}

const SUBJECTS: Record<string, number> = { yo: 0, tú: 1, él: 2, ella: 2, usted: 2, nosotros: 3, nosotras: 3, vosotros: 4, ellos: 5, ellas: 5, ustedes: 5 };

function resolvePersons(tokens: string[], idx: number, group: FormEntry[]): number[] {
    const persons = [...new Set(group.map((e) => e.person))];
    if (persons.length <= 1) return persons;
    const dativeBefore = [tokens[idx - 1], tokens[idx - 2]].some((t) => ['me', 'te', 'le', 'nos', 'os', 'les'].includes(t ?? ''));
    if (GUSTAR_LIKE.has(group[0].infinitive) && dativeBefore && persons.includes(2)) return [2];
    for (let j = idx - 1; j >= Math.max(0, idx - 3); j--) {
        const p = SUBJECTS[tokens[j]];
        if (p !== undefined && persons.includes(p)) return [p];
    }
    return persons;
}

function displayInfinitive(tokens: string[], idx: number, infinitive: string, clitic: string, persons: number[] = []): string {
    if (!REFLEXIVE_VERBS.has(infinitive)) return infinitive;
    const prev = tokens[idx - 1] ?? '';
    const prev2 = tokens[idx - 2] ?? '';
    const pronounPerson: Record<string, number[]> = { me: [0], te: [1], se: [2, 5], nos: [3], os: [4] };
    // « se me olvida » : le pronom réfléchi « se » précède le datif.
    const pronoun = prev2 === 'se' && ['me', 'te', 'le', 'nos', 'les'].includes(prev) ? 'se' : prev;
    if (pronounPerson[pronoun]) {
        const matches = persons.length === 0 || persons.some((p) => p < 0 || pronounPerson[pronoun].includes(p));
        return matches ? `${infinitive}se` : infinitive;
    }
    if (REFLEXIVE_PRONOUNS.some((p) => clitic.startsWith(p))) return `${infinitive}se`;
    return infinitive;
}

const HABER_TO_COMPOUND: Partial<Record<TenseKey, TenseKey>> = {
    presente: 'perfecto',
    imperfecto: 'pluscuamperfecto',
    indefinido: 'pluscuamperfecto',
    futuro: 'futuro_perfecto',
    condicional: 'condicional_perfecto',
    subj_presente: 'subj_perfecto',
    subj_imperfecto: 'subj_pluscuamperfecto',
    infinitivo: 'infinitivo_compuesto',
};

/**
 * Analyse le verbe situé à `idx` dans la phrase tokenisée. `prefer` oriente le
 * choix pour une forme ambiguë (lecture de la réponse de l'utilisateur alignée
 * sur la référence).
 */
export function analyzeVerbAt(tokens: string[], idx: number, options: { strict?: boolean; prefer?: FormEntry } = {}): VerbInsight | null {
    const { entries, clitic } = verbReadings(tokens, idx, options.strict ?? true);
    if (entries.length === 0) return null;

    // Temps composés : auxiliaire haber + participe.
    const haberAt = (i: number) => lookupVerbForm(tokens[i] ?? '', true).entries.find(
        (e) => e.infinitive === 'haber' && e.person !== 6 && HABER_TO_COMPOUND[e.tense],
    );
    const partAt = (i: number) => lookupVerbForm(tokens[i] ?? '', true).entries.find((e) => e.tense === 'participio');

    let auxIdx = -1;
    let partIdx = -1;
    if (entries.some((e) => e.tense === 'participio') && haberAt(idx - 1)) {
        auxIdx = idx - 1;
        partIdx = idx;
    } else if (haberAt(idx) && partAt(idx + 1)) {
        auxIdx = idx;
        partIdx = idx + 1;
    } else if (lookupVerbForm(tokens[idx], true).clitic && haberAt(idx) === undefined) {
        // « haberle avisado »
        const base = lookupVerbForm(tokens[idx], true).entries.find((e) => e.infinitive === 'haber');
        if (base && partAt(idx + 1)) {
            auxIdx = idx;
            partIdx = idx + 1;
        }
    }
    if (auxIdx < 0 && lookupVerbForm(tokens[idx], true).entries.some((e) => e.infinitive === 'haber' && e.tense === 'infinitivo') && partAt(idx + 1)) {
        auxIdx = idx;
        partIdx = idx + 1;
    }

    if (auxIdx >= 0) {
        const auxEntries = lookupVerbForm(tokens[auxIdx], true).entries.filter((e) => e.infinitive === 'haber' && e.person !== 6);
        const auxGroup = chooseReading(tokens, auxIdx, auxEntries, '');
        const compound = HABER_TO_COMPOUND[auxGroup[0].tense] ?? 'perfecto';
        const participle = partAt(partIdx)!;
        const entry: FormEntry = { infinitive: participle.infinitive, tense: compound, person: auxGroup[0].person };
        const persons = resolvePersons(tokens, auxIdx, auxGroup);
        return {
            form: `${tokens[auxIdx]} ${tokens[partIdx]}`,
            infinitive: displayInfinitive(tokens, auxIdx, participle.infinitive, ''),
            lemma: participle.infinitive,
            tense: compound,
            tenseLabel: TENSE_LABELS[compound],
            person: personLabel(compound === 'infinitivo_compuesto' ? [-1] : persons),
            persons: compound === 'infinitivo_compuesto' ? [-1] : persons,
            reason: explain(tokens, auxIdx, 2, entry, ''),
            index: auxIdx,
            span: 2,
        };
    }

    const group = chooseReading(tokens, idx, entries, clitic, options.prefer);
    const entry = group[0];
    const persons = resolvePersons(tokens, idx, group);
    let reason = explain(tokens, idx, 1, { ...entry, person: persons[0] }, clitic);
    const twin = entries.some((e) => e.infinitive === entry.infinitive && e.person === 3
        && e.tense !== entry.tense && ['presente', 'indefinido'].includes(e.tense));
    if (twin && ['presente', 'indefinido'].includes(entry.tense) && entry.person === 3) {
        reason += ' (Pour « nosotros », présent et passé simple ont ici la même forme : c’est le contexte qui tranche.)';
    }
    return {
        form: tokens[idx],
        infinitive: displayInfinitive(tokens, idx, entry.infinitive, clitic, persons),
        lemma: entry.infinitive,
        tense: entry.tense,
        tenseLabel: TENSE_LABELS[entry.tense],
        person: personLabel(persons),
        persons,
        reason,
        index: idx,
        span: 1,
    };
}

/** Liste les groupes verbaux d'une phrase avec infinitif, temps, personne et justification. */
export function analyzeSentenceVerbs(sentence: string): VerbInsight[] {
    const tokens = tokenizeSentence(sentence);
    const insights: VerbInsight[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const insight = analyzeVerbAt(tokens, i);
        if (!insight) continue;
        // Un participe isolé est traité comme un adjectif.
        if (insight.tense === 'participio') continue;
        if (insights.some((v) => v.index === insight.index)) continue;
        insights.push(insight);
        i = insight.index + insight.span - 1;
    }
    return insights;
}

export function isKnownVerbForm(token: string): boolean {
    return lookupVerbForm(token).entries.length > 0;
}

const FORMATION: Partial<Record<TenseKey, string>> = {
    presente: 'Radical + -o, -as, -a, -amos, -áis, -an (verbes en -ar) ou -o, -es, -e, -emos/-imos, -éis/-ís, -en (-er/-ir).',
    indefinido: 'Radical + -é, -aste, -ó, -amos, -asteis, -aron (-ar) ou -í, -iste, -ió, -imos, -isteis, -ieron (-er/-ir).',
    imperfecto: 'Radical + -aba, -abas, -aba, -ábamos, -abais, -aban (-ar) ou -ía, -ías, -ía, -íamos, -íais, -ían (-er/-ir). Seuls ser, ir et ver sont irréguliers.',
    futuro: 'Infinitif entier + -é, -ás, -á, -emos, -éis, -án.',
    condicional: 'Infinitif entier (même radical que le futur) + -ía, -ías, -ía, -íamos, -íais, -ían.',
    subj_presente: 'On part du « yo » au présent, on enlève le -o et on inverse la voyelle : -e, -es, -e… pour -ar ; -a, -as, -a… pour -er/-ir.',
    subj_imperfecto: 'On part de « ellos » au passé simple, on enlève -ron et on ajoute -ra, -ras, -ra, -ramos, -rais, -ran.',
    imperativo: 'tú = 3e personne du présent (habla, come) ; usted, nosotros, ustedes = subjonctif présent ; à la forme négative, toujours le subjonctif.',
    gerundio: 'Radical + -ando (-ar) ou -iendo (-er/-ir), -yendo après une voyelle (leyendo).',
    participio: 'Radical + -ado (-ar) ou -ido (-er/-ir).',
    perfecto: 'haber au présent (he, has, ha, hemos, habéis, han) + participe passé invariable.',
    pluscuamperfecto: 'haber à l’imparfait (había, habías, había…) + participe passé.',
    futuro_perfecto: 'haber au futur (habré, habrás…) + participe passé.',
    condicional_perfecto: 'haber au conditionnel (habría, habrías…) + participe passé.',
    subj_perfecto: 'haber au subjonctif présent (haya, hayas…) + participe passé.',
    subj_pluscuamperfecto: 'haber au subjonctif imparfait (hubiera, hubieras…) + participe passé.',
    infinitivo_compuesto: 'haber à l’infinitif + participe passé.',
};

const COMPOUND_TENSES = new Set<TenseKey>(['perfecto', 'pluscuamperfecto', 'futuro_perfecto', 'condicional_perfecto', 'subj_perfecto', 'subj_pluscuamperfecto', 'infinitivo_compuesto']);

const STEM_LABEL: Record<StemChange, string> = { ie: 'e → ie', ue: 'o → ue', i: 'e → i' };

/** Explique comment se forme le temps attendu et signale une irrégularité éventuelle du verbe. */
export function formationHint(lemma: string, tense: TenseKey, persons: number[]): string {
    const parts: string[] = [];
    const formation = FORMATION[tense];
    if (formation) parts.push(`Formation : ${formation}`);
    const checkTense: TenseKey = COMPOUND_TENSES.has(tense) ? 'participio' : tense;
    const person = persons.find((p) => p >= 0 && p <= 5) ?? -1;
    const target = conjugateForm(lemma, checkTense, person);
    const regular = regularizedForm(lemma, checkTense, person);
    if (target && regular && stripAccents(target) !== stripAccents(regular)) {
        const stem = stemChangeOf(lemma);
        const what = checkTense === 'participio' ? 'son participe' : 'cette forme';
        if (isIrregular(lemma) || !stem || checkTense === 'participio') {
            parts.push(`« ${lemma} » est irrégulier pour ${what} : « ${target} ».`);
        } else {
            parts.push(`« ${lemma} » change de radical (${STEM_LABEL[stem]}) : « ${target} » (et non « ${regular} »).`);
        }
    }
    return parts.join(' ');
}
