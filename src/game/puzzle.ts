export type Color = 0 | 1 | 2;
export type Board = Color[][];
export type Move = { from: number; to: number; amount: number };
export const CAPACITY = 4;
export const COLOR_NAMES = ['lavender', 'coral', 'mint'] as const;

export const copyBoard = (board: Board): Board => board.map(bottle => [...bottle]);
export const isSorted = (bottle: Color[]) =>
    bottle.length === CAPACITY && bottle.every(color => color === bottle[0]);
export const isWon = (board: Board) =>
    board.filter(isSorted).length === 3 && board.every(bottle => !bottle.length || isSorted(bottle));

export function getMove(board: Board, from: number, to: number): Move | null {
    if (from === to || !board[from]?.length || !board[to] || board[to].length === CAPACITY) return null;
    const source = board[from];
    const target = board[to];
    const color = source[source.length - 1];
    if (target.length && target[target.length - 1] !== color) return null;
    let amount = 1;
    while (amount < source.length && source[source.length - 1 - amount] === color) amount++;
    return { from, to, amount: Math.min(amount, CAPACITY - target.length) };
}

export function pour(board: Board, move: Move): Board {
    const next = copyBoard(board);
    next[move.to].push(...next[move.from].splice(-move.amount));
    return next;
}

// Bottle positions are interchangeable for search, but moves retain their real indices.
const signature = (board: Board) => board.map(bottle => bottle.join('')).sort().join('|');

export function solve(board: Board): Move[] | null {
    const queue: { board: Board; parent: number; move: Move | null }[] = [
        { board: copyBoard(board), parent: -1, move: null },
    ];
    const seen = new Set([signature(board)]);
    for (let index = 0; index < queue.length; index++) {
        const current = queue[index];
        if (isWon(current.board)) {
            const path: Move[] = [];
            let node = current;
            while (node.move) {
                path.unshift(node.move);
                node = queue[node.parent];
            }
            return path;
        }
        for (let from = 0; from < board.length; from++) {
            if (isSorted(current.board[from])) continue;
            for (let to = 0; to < board.length; to++) {
                const source = current.board[from];
                if (!current.board[to].length && source.every(color => color === source[0])) continue;
                const move = getMove(current.board, from, to);
                if (!move) continue;
                const next = pour(current.board, move);
                const key = signature(next);
                if (seen.has(key)) continue;
                seen.add(key);
                queue.push({ board: next, parent: index, move });
            }
        }
    }
    return null;
}

export function createLevel(level: number): Board {
    // Seeded shuffles make Restart reproduce the exact same puzzle.
    let seed = level * 9301 + 49297;
    const colors: Color[] = [0, 1, 2, 1, 2, 0, 2, 0, 1, 0, 1, 2];
    for (let index = colors.length - 1; index > 0; index--) {
        seed = (seed * 9301 + 49297) % 233280;
        const other = Math.floor((seed / 233280) * (index + 1));
        [colors[index], colors[other]] = [colors[other], colors[index]];
    }
    const board = [colors.slice(0, 4), colors.slice(4, 8), colors.slice(8), [], []];
    if (isWon(board) || !solve(board)) return [[0, 1, 2, 0], [1, 2, 0, 1], [2, 0, 1, 2], [], []];
    return board;
}
