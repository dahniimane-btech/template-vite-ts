import StartGame from './game/main';

const icons = {
    drop: '<path d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
    undo: '<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14" transform="translate(0 -2)"/>',
    reset: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
    hint: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = (name: keyof typeof icons) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <header class="site-header">
        <a class="brand" href="./" aria-label="Chroma home"><span class="brand-icon">${icon('drop')}</span>chroma<span class="brand-dot">.</span></a>
        <span class="header-caption">A LITTLE COLOR. A LITTLE CALM.</span>
        <button class="text-button" id="help-button">${icon('help')} How to play</button>
    </header>
    <main>
        <section class="intro">
            <div class="eyebrow"><span></span> THE COLOR SORT PUZZLE</div>
            <h1>A little order.<br class="mobile-break"> A lot of <em>calm.</em></h1>
            <p>One color per bottle. One satisfying pour at a time.</p>
        </section>
        <section class="game-card" aria-label="Color sorting game">
            <div class="game-toolbar">
                <div class="level-label"><span class="level-icon">${icon('drop')}</span><div><span class="small-label">YOUR DAILY DOSE OF FOCUS</span><h2>Level <span id="level">01</span> <span class="difficulty">Easy flow</span></h2></div></div>
                <div class="stats"><div><span class="small-label">MOVES</span><strong id="moves">0</strong></div><span class="stat-divider"></span><div><span class="small-label">TIME</span><strong id="time">00:00</strong></div></div>
            </div>
            <div class="play-area">
                <div class="goal"><span class="goal-dots"><i></i><i></i><i></i></span> Three colors. Three happy bottles.</div>
                <div class="bottle-stage">
                    <div id="game-container" aria-hidden="true"></div>
                    <div class="bottle-controls" role="group" aria-label="Bottles: choose a source, then a destination">
                        ${Array.from({ length: 5 }, (_, i) => `<button class="bottle-button" data-bottle="${i}" aria-label="Bottle ${i + 1}"><span class="bottle-number">${i + 1}</span><span class="bottle-state">${i > 2 ? 'EMPTY' : ''}</span></button>`).join('')}
                    </div>
                </div>
                <p id="status" class="status" role="status" aria-live="polite">Pick a bottle. Then pick where to pour.</p>
                <div class="game-actions">
                    <button id="undo-button" class="action-button" disabled>${icon('undo')} Undo</button>
                    <button id="restart-button" class="action-button">${icon('reset')} Restart</button>
                    <span class="action-divider"></span>
                    <button id="hint-button" class="action-button hint-button">${icon('hint')} A little hint</button>
                </div>
                <div id="win-panel" class="win-panel" hidden>
                    <span class="win-icon">${icon('check')}</span><h2>Beautifully sorted.</h2>
                    <p id="win-summary"></p><button id="next-button" class="primary-button">Next level ${icon('arrow')}</button>
                </div>
            </div>
            <div class="game-footer"><span><span class="tiny-sparkle">✧</span> No rush. Find your flow.</span><div><span id="progress">0 of 3 sorted</span><span class="progress-dots" aria-hidden="true"><i></i><i></i><i></i></span><button id="sound-button" class="icon-button muted" aria-label="Enable sound" aria-pressed="false">${icon('sound')}</button></div></div>
        </section>
        <section class="how-it-works" aria-label="How it works">
            <div class="instruction"><span class="step-number">01</span><div><h3>Pick & pour</h3><p>Tap a bottle, then another to pour.</p></div></div>
            <div class="instruction"><span class="step-number">02</span><div><h3>Keep it colorful</h3><p>Pour onto the same color or into an empty bottle.</p></div></div>
            <div class="instruction"><span class="step-number">03</span><div><h3>Find your balance</h3><p>Fill three bottles with one color each.</p></div></div>
        </section>
        <footer class="site-footer"><span>MADE FOR A MOMENT OF CLARITY</span><span class="footer-decoration">✧</span><span>Less noise. More flow.</span></footer>
    </main>
    <dialog id="help-dialog"><button id="close-help" class="dialog-close" aria-label="Close instructions">×</button><span class="eyebrow">A SMALL MOMENT FOR YOU</span><h2>Find your flow.</h2><p>Three colors are mixed across three bottles. Use the two empty bottles to give them a little room.</p><ol><li>Select a bottle, then select another to pour.</li><li>Only matching top colors can go together. Any color can go into an empty bottle.</li><li>Each bottle holds four portions. Fill three bottles with a single color each to win.</li></ol><p>Use <strong>Undo</strong> whenever you like, or <strong>A little hint</strong> for your next move. Keyboard players can use Tab and Enter, or number keys 1–5. Escape clears your selection.</p><button id="play-button" class="primary-button">Let's play ${icon('arrow')}</button></dialog>
`;

const help = document.querySelector<HTMLDialogElement>('#help-dialog')!;
document.querySelector('#help-button')!.addEventListener('click', () => help.showModal());
document.querySelector('#close-help')!.addEventListener('click', () => help.close());
document.querySelector('#play-button')!.addEventListener('click', () => help.close());
StartGame('game-container');
