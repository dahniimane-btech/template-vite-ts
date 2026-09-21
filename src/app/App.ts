import type { AppState, CardState, Grade } from './types';
import { loadState, saveState } from './storage';
import {
    ensureDailyGeneration,
    buildDailySession,
    buildWritingSession,
    scheduleCard,
    getPhrase,
    totalMastered,
    shuffle,
} from './srs';
import { addDays, todayISO } from './date';
import type { DailySession } from './srs';
import { evaluateTranslation } from './evaluator';
import type { TranslationEvaluation } from './evaluator';

type View = 'home' | 'session' | 'summary' | 'settings';
type SessionKind = 'daily' | 'writing';

export class App {
    private root: HTMLElement;
    private state: AppState;
    private view: View = 'home';

    private queue: CardState[] = [];
    private queueIndex = 0;
    private sessionKind: SessionKind = 'daily';
    private flipped = false;
    private productionAnswer = '';
    private evaluation: TranslationEvaluation | null = null;
    private sessionStudied = 0;
    private sessionAgain = 0;

    constructor(root: HTMLElement) {
        this.root = root;
        this.state = loadState();
        this.applyStreak();
        this.state = ensureDailyGeneration(this.state);
        saveState(this.state);
        this.render();

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    private applyStreak(): void {
        const today = todayISO();
        if (this.state.lastStudyDate === today) return;
        if (this.state.lastStudyDate === addDays(today, -1)) {
            // streak continues, will increment when session finishes today
            return;
        }
        if (this.state.lastStudyDate !== null && this.state.lastStudyDate !== addDays(today, -1)) {
            this.state.streak = 0;
        }
    }

    private persist(): void {
        saveState(this.state);
    }

    private goHome(): void {
        this.view = 'home';
        this.render();
    }

    private startSession(scope: 'all' | 'new' | 'review' = 'all'): void {
        const session: DailySession = buildDailySession(this.state);
        this.sessionKind = 'daily';
        const picked =
            scope === 'new' ? session.newCards
            : scope === 'review' ? session.reviewCards
            : [...session.reviewCards, ...session.newCards];
        this.queue = shuffle(picked);
        this.resetSession();
    }

    private startWritingSession(): void {
        this.sessionKind = 'writing';
        this.queue = shuffle(buildWritingSession(this.state).cards);
        this.resetSession();
    }

    private resetSession(): void {
        this.queueIndex = 0;
        this.flipped = false;
        this.productionAnswer = '';
        this.evaluation = null;
        this.sessionStudied = 0;
        this.sessionAgain = 0;

        if (this.queue.length === 0) {
            this.view = 'summary';
        } else {
            this.view = 'session';
        }
        this.render();
    }

    private flip(): void {
        if (this.view !== 'session') return;
        this.flipped = !this.flipped;
        this.render();
    }

    private checkProductionAnswer(): void {
        const card = this.queue[this.queueIndex];
        const phrase = card ? getPhrase(card.id) : undefined;
        const isProduction = this.sessionKind === 'writing' || card?.direction === 'fr-es';
        if (!card || !phrase || !isProduction || !this.productionAnswer.trim()) return;

        this.evaluation = evaluateTranslation(this.productionAnswer, phrase);
        this.flipped = true;
        this.render();
    }

    private grade(g: Grade): void {
        const card = this.queue[this.queueIndex];
        if (!card) return;

        if (this.sessionKind === 'daily') {
            const today = todayISO();
            const updated = scheduleCard(card, g, today);
            this.state.cards[updated.id] = updated;
        }
        this.sessionStudied++;
        if (g === 'again') this.sessionAgain++;

        this.queueIndex++;
        this.flipped = false;
        this.productionAnswer = '';
        this.evaluation = null;

        if (this.queueIndex >= this.queue.length) {
            if (this.sessionKind === 'daily') {
                const today2 = todayISO();
                if (this.state.lastStudyDate !== today2) {
                    const wasYesterday = this.state.lastStudyDate === addDays(today2, -1);
                    this.state.streak = wasYesterday ? this.state.streak + 1 : 1;
                    this.state.lastStudyDate = today2;
                    this.state.history.push({ date: today2, studied: this.sessionStudied });
                } else {
                    const entry = this.state.history.find((h) => h.date === today2);
                    if (entry) entry.studied += this.sessionStudied;
                }
                this.persist();
            }
            this.view = 'summary';
        } else if (this.sessionKind === 'daily') {
            this.persist();
        }
        this.render();
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (this.view !== 'session') return;
        const target = e.target as HTMLElement | null;
        if (e.key === 'Escape') {
            e.preventDefault();
            this.leaveSession();
            return;
        }
        if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;
        if (!this.flipped) {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.flip();
            }
            return;
        }
        if (e.key === '1') this.grade('again');
        else if (e.key === '2') this.grade('hard');
        else if (e.key === '3') this.grade('good');
        else if (e.key === '4') this.grade('easy');
    }

    private render(): void {
        this.root.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'app-shell';

        container.appendChild(this.renderHeader());

        if (this.view === 'home') container.appendChild(this.renderHome());
        else if (this.view === 'session') container.appendChild(this.renderSession());
        else if (this.view === 'summary') container.appendChild(this.renderSummary());
        else if (this.view === 'settings') container.appendChild(this.renderSettings());

        this.root.appendChild(container);
    }

    private renderHeader(): HTMLElement {
        const header = document.createElement('header');
        header.className = 'app-header';

        const title = document.createElement('div');
        title.className = 'app-title';
        title.textContent = '🇪🇸 Español a diario';

        const stats = document.createElement('div');
        stats.className = 'app-stats';
        stats.innerHTML = `
            <span class="stat">🔥 ${this.state.streak} j.</span>
            <span class="stat">✅ ${totalMastered(this.state)} maîtrisées</span>
        `;

        const gear = document.createElement('button');
        gear.className = 'icon-btn';
        gear.textContent = '⚙️';
        gear.title = 'Réglages';
        gear.onclick = () => { this.view = this.view === 'settings' ? 'home' : 'settings'; this.render(); };

        if (this.view === 'home') {
            header.append(title, stats, gear);
            return header;
        }

        // Hors accueil, une flèche permet d'abandonner la séance en cours pour
        // revenir choisir un autre type d'entraînement.
        const back = document.createElement('button');
        back.className = 'icon-btn back-btn';
        back.textContent = '←';
        back.title = 'Retour à l\'accueil';
        back.setAttribute('aria-label', 'Retour à l\'accueil');
        back.onclick = () => this.leaveSession();

        header.append(back, title, stats, gear);
        return header;
    }

    /**
     * Quitte la vue courante pour revenir à l'accueil. La progression déjà
     * notée reste enregistrée ; seules les cartes non vues sont abandonnées.
     */
    private leaveSession(): void {
        this.queue = [];
        this.queueIndex = 0;
        this.flipped = false;
        this.productionAnswer = '';
        this.evaluation = null;
        this.goHome();
    }

    private renderHome(): HTMLElement {
        // Relancé à chaque retour sur l'accueil : si l'onglet est resté ouvert
        // après minuit, les nouvelles phrases du jour sont quand même générées.
        const regenerated = ensureDailyGeneration(this.state);
        if (regenerated !== this.state) {
            this.state = regenerated;
            saveState(this.state);
        }

        const session = buildDailySession(this.state);
        const wrap = document.createElement('div');
        wrap.className = 'view view-home';

        const newCount = session.newCards.length;
        const reviewCount = session.reviewCards.length;
        const writingSession = buildWritingSession(this.state);
        const writingCount = writingSession.cards.length;
        const today = todayISO();
        const todayWritingCount = writingSession.byDay.find((entry) => entry.date === today)?.count ?? 0;
        const yesterdayWritingCount = writingSession.byDay.find(
            (entry) => entry.date === addDays(today, -1),
        )?.count ?? 0;

        wrap.innerHTML = `
            <h1>Ta séance du jour</h1>
            <div class="cards-summary">
                <div class="summary-card">
                    <div class="summary-number">${newCount}</div>
                    <div class="summary-label">nouvelles phrases</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${reviewCount}</div>
                    <div class="summary-label">à réviser</div>
                </div>
            </div>
            ${session.yesterdayCount > 0 ? `<p class="backlog-note">Dont ${session.yesterdayCount} phrase(s) découverte(s) hier, à consolider aujourd'hui.</p>` : ''}
            ${session.backlogLeft > 0 ? `<p class="backlog-note">+ ${session.backlogLeft} révision(s) plus anciennes en attente, réparties sur les prochains jours.</p>` : ''}
            ${session.bankRemaining === 0
                ? '<p class="backlog-note">Tu as découvert toutes les phrases de la banque actuelle ! Ajoute-en de nouvelles dans <code>src/app/phrases.ts</code>.</p>'
                : `<p class="backlog-note">Il reste ${session.bankRemaining} phrase(s) inédite(s) dans la banque, soit environ ${Math.ceil(session.bankRemaining / Math.max(1, this.state.settings.newPerDay))} jour(s) de nouveautés.</p>`}
        `;

        const startBtn = document.createElement('button');
        startBtn.className = 'primary-btn';
        startBtn.textContent = newCount + reviewCount > 0 ? 'Commencer la séance' : 'Rien à étudier aujourd\'hui 🎉';
        startBtn.disabled = newCount + reviewCount === 0;
        startBtn.onclick = () => this.startSession('all');

        wrap.appendChild(startBtn);

        // Démarrages ciblés : permet de basculer entre révision et nouveautés
        // sans devoir terminer la séance complète.
        const scopeRow = document.createElement('div');
        scopeRow.className = 'scope-row';

        const reviewBtn = document.createElement('button');
        reviewBtn.className = 'secondary-btn';
        reviewBtn.textContent = `🔁 Réviser seulement (${reviewCount})`;
        reviewBtn.disabled = reviewCount === 0;
        reviewBtn.onclick = () => this.startSession('review');

        const newBtn = document.createElement('button');
        newBtn.className = 'secondary-btn';
        newBtn.textContent = `✨ Nouvelles phrases (${newCount})`;
        newBtn.disabled = newCount === 0;
        newBtn.onclick = () => this.startSession('new');

        scopeRow.append(reviewBtn, newBtn);
        wrap.appendChild(scopeRow);

        const writingBtn = document.createElement('button');
        writingBtn.className = 'secondary-btn writing-start-btn';
        writingBtn.textContent = writingCount > 0
            ? `✍️ S'entraîner à écrire (${writingCount} phrases)`
            : `✍️ S'entraîner à écrire`;
        writingBtn.disabled = writingCount === 0;
        writingBtn.onclick = () => this.startWritingSession();
        wrap.appendChild(writingBtn);

        const writingHelp = document.createElement('p');
        writingHelp.className = 'writing-help';
        writingHelp.textContent = writingCount > 0
            ? `${todayWritingCount} de J + ${yesterdayWritingCount} de J-1`
                + (writingSession.byDay.length > 2 ? ' + complément des jours précédents.' : '.')
            : 'Disponible dès le premier jour, sans attendre que les cartes soient maîtrisées.';
        wrap.appendChild(writingHelp);
        return wrap;
    }

    private renderSession(): HTMLElement {
        const wrap = document.createElement('div');
        wrap.className = 'view view-session';

        const card = this.queue[this.queueIndex];
        if (!card) {
            wrap.textContent = 'Aucune carte.';
            return wrap;
        }
        const phrase = getPhrase(card.id);
        if (!phrase) {
            wrap.textContent = 'Phrase introuvable.';
            return wrap;
        }

        const progress = document.createElement('div');
        progress.className = 'progress-bar';
        const pct = Math.round((this.queueIndex / this.queue.length) * 100);
        progress.innerHTML = `<div class="progress-fill" style="width:${pct}%"></div>`;
        progress.title = `${this.queueIndex}/${this.queue.length}`;

        const isProduction = this.sessionKind === 'writing' || card.direction === 'fr-es';
        wrap.appendChild(progress);

        if (isProduction) {
            wrap.appendChild(this.renderProductionCard(phrase));
        } else {
            const cardEl = document.createElement('div');
            cardEl.className = 'flash-card' + (this.flipped ? ' flipped' : '');
            cardEl.innerHTML = `
                <div class="flash-card-inner">
                    <div class="flash-face flash-front">
                        <div class="flash-topic">${phrase.topic} · Reconnaissance</div>
                        <div class="flash-text">${phrase.es}</div>
                        <div class="flash-hint">Touche la carte pour voir la traduction</div>
                    </div>
                    <div class="flash-face flash-back">
                        <div class="flash-topic">Traduction</div>
                        <div class="flash-text">${phrase.fr}</div>
                    </div>
                </div>
            `;
            cardEl.onclick = () => this.flip();
            wrap.appendChild(cardEl);
        }

        if (this.flipped) {
            const btns = document.createElement('div');
            btns.className = 'grade-buttons';
            btns.innerHTML = `
                <button data-g="again" class="grade-btn grade-again">Encore <span>1</span></button>
                <button data-g="hard" class="grade-btn grade-hard">Difficile <span>2</span></button>
                <button data-g="good" class="grade-btn grade-good">Bien <span>3</span></button>
                <button data-g="easy" class="grade-btn grade-easy">Facile <span>4</span></button>
            `;
            btns.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
                b.onclick = (ev) => {
                    ev.stopPropagation();
                    this.grade(b.dataset.g as Grade);
                };
            });
            wrap.appendChild(btns);
        }

        return wrap;
    }

    private renderProductionCard(phrase: NonNullable<ReturnType<typeof getPhrase>>): HTMLElement {
        const container = document.createElement('div');
        container.className = 'production-card';

        const topic = document.createElement('div');
        topic.className = 'flash-topic';
        topic.textContent = `${phrase.topic} · Production en espagnol 🎯`;

        const prompt = document.createElement('div');
        prompt.className = 'flash-text';
        prompt.textContent = phrase.fr;

        container.append(topic, prompt);

        if (!this.evaluation) {
            const hint = document.createElement('p');
            hint.className = 'production-hint';
            hint.textContent = 'Traduis avec tes propres mots. Le sens, le lexique et la conjugaison comptent davantage que le mot-à-mot.';

            const input = document.createElement('textarea');
            input.className = 'production-input';
            input.rows = 3;
            input.lang = 'es';
            input.autocomplete = 'off';
            input.spellcheck = true;
            input.placeholder = 'Écris ta phrase en espagnol…';
            input.value = this.productionAnswer;
            input.oninput = () => { this.productionAnswer = input.value; };
            input.onkeydown = (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.productionAnswer = input.value;
                    this.checkProductionAnswer();
                }
            };

            const checkButton = document.createElement('button');
            checkButton.className = 'primary-btn';
            checkButton.textContent = 'Vérifier ma phrase';
            checkButton.onclick = () => {
                this.productionAnswer = input.value;
                this.checkProductionAnswer();
            };

            container.append(hint, input, checkButton);
            queueMicrotask(() => input.focus());
            return container;
        }

        const result = document.createElement('div');
        result.className = `evaluation evaluation-${this.evaluation.level}`;

        const heading = document.createElement('strong');
        heading.textContent = this.evaluation.level === 'correct'
            ? `Correct · ${this.evaluation.score}%`
            : this.evaluation.level === 'close'
                ? `Presque · ${this.evaluation.score}%`
                : `À retravailler · ${this.evaluation.score}%`;

        const summary = document.createElement('p');
        summary.textContent = this.evaluation.summary;
        result.append(heading, summary);

        const answerLine = document.createElement('p');
        answerLine.className = 'answer-line';
        answerLine.textContent = `Ta réponse : ${this.productionAnswer}`;
        result.appendChild(answerLine);

        const referenceLine = document.createElement('p');
        referenceLine.className = 'reference-line';
        if (this.evaluation.level === 'correct') {
            referenceLine.textContent = this.evaluation.isAlternativePhrasing
                ? `Voici ce que je propose aussi : ${this.evaluation.reference}`
                : `Correspond à : ${this.evaluation.reference}`;
        } else {
            referenceLine.textContent = `Proposition : ${this.evaluation.reference}`;
        }
        result.appendChild(referenceLine);

        if (this.evaluation.level !== 'correct' && this.evaluation.conjugationIssues.length > 0) {
            const section = document.createElement('div');
            section.className = 'feedback-section';
            const title = document.createElement('h3');
            title.textContent = 'Conjugaison';
            section.appendChild(title);

            this.evaluation.conjugationIssues.forEach((issue) => {
                const detail = document.createElement('div');
                detail.className = 'feedback-detail';

                const correction = document.createElement('strong');
                correction.textContent = issue.found
                    ? `${issue.found.form} → ${issue.expected.form}`
                    : `Forme manquante : ${issue.expected.form}`;

                const expected = document.createElement('p');
                expected.textContent = `Attendu : ${issue.expected.infinitive} · ${issue.expected.tense} · ${issue.expected.person}.`;
                detail.append(correction, expected);

                if (issue.found) {
                    const found = document.createElement('p');
                    found.textContent = `Ta forme : ${issue.found.infinitive} · ${issue.found.tense} · ${issue.found.person}.`;
                    detail.appendChild(found);
                }

                const explanation = document.createElement('p');
                explanation.textContent = issue.explanation;
                detail.appendChild(explanation);
                section.appendChild(detail);
            });
            result.appendChild(section);
        }
        if (this.evaluation.level !== 'correct' && this.evaluation.spellingIssues.length > 0) {
            const section = document.createElement('div');
            section.className = 'feedback-section';
            const title = document.createElement('h3');
            title.textContent = 'Orthographe et accents';
            section.appendChild(title);

            const list = document.createElement('ul');
            this.evaluation.spellingIssues.forEach((issue) => {
                const item = document.createElement('li');
                item.textContent = issue.kind === 'accent'
                    ? `Accent : « ${issue.found} » doit s'écrire « ${issue.expected} ».`
                    : `Orthographe probable : « ${issue.found} » → « ${issue.expected} ».`;
                list.appendChild(item);
            });
            section.appendChild(list);
            result.appendChild(section);
        }
        if (this.evaluation.level !== 'correct' && this.evaluation.missingWords.length > 0) {
            const missingLexicon = this.evaluation.missingWords.filter((word) =>
                !this.evaluation?.conjugationIssues.some((issue) => issue.expected.form === word));
            if (missingLexicon.length > 0) {
                const section = document.createElement('div');
                section.className = 'feedback-section';
                const title = document.createElement('h3');
                title.textContent = 'Lexique ou idée manquante';
                const detail = document.createElement('p');
                detail.textContent = `Compare ces éléments avec ta formulation : ${missingLexicon
                    .map((word) => `« ${word} »`)
                    .join(', ')}. Ils portent une partie importante du sens de la proposition.`;
                section.append(title, detail);
                result.appendChild(section);
            }
        }
        if (this.evaluation.extraWords.length > 0 && this.evaluation.level !== 'correct') {
            const section = document.createElement('div');
            section.className = 'feedback-section';
            const title = document.createElement('h3');
            title.textContent = 'Mots à vérifier dans ta réponse';
            const detail = document.createElement('p');
            detail.textContent = this.evaluation.extraWords.map((word) => `« ${word} »`).join(', ');
            section.append(title, detail);
            result.appendChild(section);
        }
        if (this.evaluation.level !== 'correct' && this.evaluation.accentWarning && this.evaluation.spellingIssues.length === 0) {
            const accents = document.createElement('p');
            accents.textContent = 'Le sens est bon, mais vérifie les accents écrits.';
            result.appendChild(accents);
        }

        const retryButton = document.createElement('button');
        retryButton.className = 'secondary-btn';
        retryButton.textContent = 'Modifier ma réponse';
        retryButton.onclick = () => {
            this.evaluation = null;
            this.flipped = false;
            this.render();
        };

        container.append(result, retryButton);
        return container;
    }

    private renderSummary(): HTMLElement {
        const wrap = document.createElement('div');
        wrap.className = 'view view-summary';
        wrap.innerHTML = `
            <h1>${this.sessionKind === 'writing' ? 'Entraînement écrit terminé ✍️' : 'Séance terminée 🎉'}</h1>
            <p>${this.sessionStudied} carte(s) étudiée(s) aujourd'hui.</p>
            <p>${this.sessionAgain} à revoir bientôt.</p>
            ${this.sessionKind === 'daily'
                ? `<p>Série actuelle : 🔥 ${this.state.streak} jour(s) consécutif(s).</p>`
                : `<p>Cet entraînement libre ne modifie pas le planning de répétition espacée.</p>`}
        `;
        const btn = document.createElement('button');
        btn.className = 'primary-btn';
        btn.textContent = 'Retour à l\'accueil';
        btn.onclick = () => this.goHome();
        wrap.appendChild(btn);
        return wrap;
    }

    private renderSettings(): HTMLElement {
        const wrap = document.createElement('div');
        wrap.className = 'view view-settings';
        wrap.innerHTML = `<h1>Réglages</h1>`;

        const newRow = document.createElement('label');
        newRow.className = 'settings-row';
        newRow.innerHTML = `<span>Nouvelles phrases / jour</span>`;
        const newInput = document.createElement('input');
        newInput.type = 'number';
        newInput.min = '0';
        newInput.max = '100';
        newInput.value = String(this.state.settings.newPerDay);
        newInput.onchange = () => {
            this.state.settings.newPerDay = Math.max(0, Number(newInput.value) || 0);
            this.persist();
        };
        newRow.appendChild(newInput);

        const revRow = document.createElement('label');
        revRow.className = 'settings-row';
        revRow.innerHTML = `<span>Révisions / jour</span>`;
        const revInput = document.createElement('input');
        revInput.type = 'number';
        revInput.min = '0';
        revInput.max = '200';
        revInput.value = String(this.state.settings.reviewPerDay);
        revInput.onchange = () => {
            this.state.settings.reviewPerDay = Math.max(0, Number(revInput.value) || 0);
            this.persist();
        };
        revRow.appendChild(revInput);

        const writingRow = document.createElement('label');
        writingRow.className = 'settings-row';
        writingRow.innerHTML = `<span>Phrases à pratiquer FR → ES / jour</span>`;
        const writingInput = document.createElement('input');
        writingInput.type = 'number';
        writingInput.min = '20';
        writingInput.max = '200';
        writingInput.step = '5';
        writingInput.value = String(this.state.settings.writingPerDay);
        writingInput.onchange = () => {
            const requested = Number(writingInput.value) || 20;
            this.state.settings.writingPerDay = Math.min(200, Math.max(20, requested));
            writingInput.value = String(this.state.settings.writingPerDay);
            this.persist();
        };
        writingRow.appendChild(writingInput);

        const writingHelp = document.createElement('p');
        writingHelp.className = 'settings-help';
        writingHelp.textContent = '20 = 10 phrases de J + 10 de J-1. Au-delà, le complément est pris dans J-2, J-3, etc.';

        wrap.append(newRow, revRow, writingRow, writingHelp);

        const backBtn = document.createElement('button');
        backBtn.className = 'primary-btn';
        backBtn.textContent = 'Retour';
        backBtn.onclick = () => this.goHome();
        wrap.appendChild(backBtn);

        return wrap;
    }
}
