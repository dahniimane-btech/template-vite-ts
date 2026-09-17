import { Scene, GameObjects } from 'phaser';
import { Board, COLOR_NAMES, copyBoard, createLevel, getMove, isSorted, isWon, pour, solve } from '../puzzle';

const COLORS = [0xa88be8, 0xf39587, 0x7dc8b0];
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

export class Game extends Scene {
    private board: Board = [];
    private history: Board[] = [];
    private bottles: GameObjects.Container[] = [];
    private selected: number | null = null;
    private level = 1;
    private busy = false;
    private elapsed = 0;
    private started = false;
    private sound = false;
    private audio: AudioContext | null = null;
    private listeners = new AbortController();

    constructor() { super('Game'); }

    create() {
        const signal = this.listeners.signal;
        document.querySelectorAll<HTMLButtonElement>('[data-bottle]').forEach((button, index) => {
            button.addEventListener('click', () => this.choose(index), { signal });
        });
        $('#undo-button').addEventListener('click', () => this.undo(), { signal });
        $('#restart-button').addEventListener('click', () => this.startLevel(), { signal });
        $('#hint-button').addEventListener('click', () => this.hint(), { signal });
        $('#next-button').addEventListener('click', () => { this.level++; this.startLevel(); }, { signal });
        $('#sound-button').addEventListener('click', () => {
            this.sound = !this.sound;
            $('#sound-button').setAttribute('aria-pressed', String(this.sound));
            $('#sound-button').setAttribute('aria-label', this.sound ? 'Mute sound' : 'Enable sound');
            $('#sound-button').classList.toggle('muted', !this.sound);
            if (this.sound) this.chime();
        }, { signal });
        document.addEventListener('keydown', event => {
            if ($('#help-dialog').hasAttribute('open')) return;
            if (/^[1-5]$/.test(event.key)) this.choose(Number(event.key) - 1);
            if (event.key === 'Escape' && !this.busy) {
                this.selected = null;
                this.render();
            }
        }, { signal });
        this.events.once('shutdown', () => {
            this.listeners.abort();
            if (this.audio) void this.audio.close();
        });
        this.startLevel();
    }

    update(_time: number, delta: number) {
        if (!this.started || isWon(this.board) || document.hidden || $('#help-dialog').hasAttribute('open')) return;
        this.elapsed += delta;
        $('#time').textContent = this.timeLabel();
    }

    private timeLabel() {
        const seconds = Math.floor(this.elapsed / 1000);
        return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }

    private startLevel() {
        if (this.busy) return;
        this.board = createLevel(this.level);
        this.history = [];
        this.selected = null;
        this.elapsed = 0;
        this.started = false;
        $('#level').textContent = String(this.level).padStart(2, '0');
        $('#time').textContent = '00:00';
        $('#win-panel').hidden = true;
        this.message('Pick a bottle. Then pick where to pour.');
        this.render();
    }

    private choose(index: number) {
        if (this.busy || isWon(this.board)) return;
        this.clearHints();
        if (this.selected === index) {
            this.selected = null;
            this.message('Pick a bottle. Then pick where to pour.');
            this.render();
            return;
        }
        if (this.selected === null) {
            if (!this.board[index].length) {
                this.message('This bottle is empty. Pick a bottle with some color first.');
                return;
            }
            this.selected = index;
            this.message(`Bottle ${index + 1} selected. Choose a matching color or an empty bottle.`);
            this.render();
            return;
        }
        const move = getMove(this.board, this.selected, index);
        if (!move) {
            this.message(this.board[index].length === 4
                ? 'That bottle is full. Try a bottle with a little more room.'
                : 'Those colors do not match. Try a matching top color or an empty bottle.');
            this.tweens.add({ targets: this.bottles[index], x: this.bottles[index].x + 6, duration: 65, yoyo: true, repeat: 2 });
            return;
        }
        this.busy = true;
        this.started = true;
        this.setDisabled();
        const source = this.bottles[move.from];
        const target = this.bottles[move.to];
        const color = this.board[move.from][this.board[move.from].length - 1];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.tweens.add({ targets: source, angle: move.to > move.from ? 13 : -13, y: -20, duration: reducedMotion ? 0 : 160 });
        if (!reducedMotion) {
            for (let i = 0; i < 5; i++) {
                const drop = this.add.circle(target.x, 48 - i * 13, 4, COLORS[color], 0.85);
                this.tweens.add({ targets: drop, y: 180, alpha: 0, delay: i * 40, duration: 260, onComplete: () => drop.destroy() });
            }
        }
        this.time.delayedCall(reducedMotion ? 0 : 460, () => {
            this.history.push(copyBoard(this.board));
            this.board = pour(this.board, move);
            this.selected = null;
            this.busy = false;
            this.render();
            this.chime();
            if (isWon(this.board)) {
                this.message('All three colors have found their home. Beautifully done!');
                $('#win-summary').textContent = `A little clarity in ${this.history.length} moves and ${this.timeLabel()}.`;
                $('#win-panel').hidden = false;
                $('#next-button').focus();
            } else {
                const solution = solve(this.board);
                this.message(solution ? 'Nice pour. A little closer to clarity.' : 'No way forward from here. Undo a pour or restart to find a new flow.');
            }
        });
    }

    private undo() {
        if (this.busy || !this.history.length) return;
        this.board = this.history.pop()!;
        this.selected = null;
        $('#win-panel').hidden = true;
        this.message('A fresh perspective. Try another pour.');
        this.render();
    }

    private hint() {
        if (this.busy || isWon(this.board)) return;
        const move = solve(this.board)?.[0];
        if (!move) {
            this.message('This arrangement is stuck. Use Undo or Restart to try a different path.');
            return;
        }
        this.selected = move.from;
        this.render();
        $(`[data-bottle="${move.to}"]`).classList.add('hint-target');
        this.message(`A little nudge: pour bottle ${move.from + 1} into bottle ${move.to + 1}.`);
    }

    private message(text: string) { $('#status').textContent = text; }

    private clearHints() {
        document.querySelectorAll('.hint-target').forEach(button => button.classList.remove('hint-target'));
    }

    private setDisabled() {
        $<HTMLButtonElement>('#undo-button').disabled = this.busy || !this.history.length;
        $<HTMLButtonElement>('#restart-button').disabled = this.busy;
        $<HTMLButtonElement>('#hint-button').disabled = this.busy || isWon(this.board);
        document.querySelectorAll<HTMLButtonElement>('[data-bottle]').forEach(button => {
            button.disabled = this.busy || isWon(this.board);
        });
    }

    private render() {
        this.clearHints();
        this.bottles.forEach(bottle => bottle.destroy());
        this.bottles = this.board.map((colors, index) => this.drawBottle(colors, index));
        const sorted = this.board.filter(isSorted).length;
        $('#moves').textContent = String(this.history.length);
        $('#progress').textContent = `${sorted} of 3 sorted`;
        document.querySelectorAll('.progress-dots i').forEach((dot, index) => dot.classList.toggle('filled', index < sorted));
        this.board.forEach((bottle, index) => {
            const button = $<HTMLButtonElement>(`[data-bottle="${index}"]`);
            button.setAttribute('aria-label', `Bottle ${index + 1}: ${bottle.length ? bottle.map(color => COLOR_NAMES[color]).join(', ') + ' from bottom to top' : 'empty'}. ${4 - bottle.length} spaces available.`);
            button.setAttribute('aria-pressed', String(this.selected === index));
            button.classList.toggle('selected', this.selected === index);
            button.classList.toggle('sorted', isSorted(bottle));
            button.querySelector('.bottle-state')!.textContent = isSorted(bottle) ? 'SORTED' : bottle.length ? '' : 'EMPTY';
        });
        this.setDisabled();
    }

    private drawBottle(colors: Board[number], index: number) {
        const selected = this.selected === index;
        const container = this.add.container(140 + index * 180, selected ? -13 : 0);
        const glass = this.add.graphics();
        container.add(glass);
        glass.fillStyle(0x9384b5, 0.08);
        glass.fillEllipse(0, 313, 123, 18);
        glass.fillStyle(0xffffff, 0.62);
        glass.fillRoundedRect(-51, 104, 102, 195, 23);
        glass.fillPoints([{ x: -51, y: 130 }, { x: -51, y: 108 }, { x: -24, y: 79 }, { x: -24, y: 53 }, { x: 24, y: 53 }, { x: 24, y: 79 }, { x: 51, y: 108 }, { x: 51, y: 130 }], true);
        const liquid = this.add.graphics();
        container.add(liquid);
        colors.forEach((color, portion) => {
            const y = 289 - (portion + 1) * 44;
            liquid.fillStyle(COLORS[color], 0.96);
            if (portion === 0) liquid.fillRoundedRect(-43, y, 86, 44, { tl: 0, tr: 0, bl: 15, br: 15 });
            else liquid.fillRect(-43, y, 86, 44);
            liquid.fillStyle(0xffffff, 0.17);
            liquid.fillRect(-42, y, 84, 2);
        });
        if (colors.length) {
            liquid.fillStyle(COLORS[colors[colors.length - 1]], 1);
            liquid.fillEllipse(0, 289 - colors.length * 44, 86, 6);
        }
        const outline = this.add.graphics();
        container.add(outline);
        outline.lineStyle(selected ? 2.5 : 2, selected ? 0x9473ce : 0xc9c4d8, selected ? 0.9 : 0.7);
        outline.beginPath();
        outline.moveTo(-24, 56);
        outline.lineTo(-24, 79);
        outline.lineTo(-47, 104);
        outline.lineTo(-51, 116);
        outline.lineTo(-51, 276);
        outline.strokePath();
        outline.beginPath();
        outline.moveTo(24, 56);
        outline.lineTo(24, 79);
        outline.lineTo(47, 104);
        outline.lineTo(51, 116);
        outline.lineTo(51, 276);
        outline.strokePath();
        outline.beginPath();
        outline.arc(-28, 276, 23, Math.PI, Math.PI / 2, true);
        outline.lineTo(28, 299);
        outline.arc(28, 276, 23, Math.PI / 2, 0, true);
        outline.strokePath();
        outline.fillStyle(0xf9f8fd, 1);
        outline.fillRoundedRect(-30, 48, 60, 11, 4);
        outline.lineStyle(2, selected ? 0x9473ce : 0xc9c4d8, 0.75);
        outline.strokeRoundedRect(-30, 48, 60, 11, 4);
        outline.fillStyle(0xffffff, 0.4);
        outline.fillRoundedRect(-37, 116, 6, 154, 3);
        outline.fillStyle(0xffffff, 0.22);
        outline.fillRoundedRect(33, 132, 3, 122, 2);
        return container;
    }

    private chime() {
        if (!this.sound) return;
        this.audio ??= new AudioContext();
        const audio = this.audio;
        void audio.resume().then(() => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            oscillator.connect(gain);
            gain.connect(audio.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(isWon(this.board) ? 660 : 440 + this.history.length % 3 * 110, audio.currentTime);
            gain.gain.setValueAtTime(0.06, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
            oscillator.start();
            oscillator.stop(audio.currentTime + 0.35);
        }).catch((error: unknown) => {
            console.error('Could not play game sound:', error);
            this.message('Sound could not start. You can keep playing without it.');
        });
    }
}
