import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/game/puzzle.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { getMove, pour, solve, createLevel, isWon, isSorted } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('only matching colors or empty destinations accept pours', () => {
    const board = [[0, 1], [2], [], [0, 0, 0, 0], []];
    assert.equal(getMove(board, 0, 1), null);
    assert.equal(getMove(board, 0, 0), null);
    assert.equal(getMove(board, 2, 1), null);
    assert.equal(getMove(board, 0, 3), null);
    assert.equal(getMove(board, -1, 2), null);
    assert.equal(getMove(board, 0, 5), null);
    assert.deepEqual(getMove(board, 0, 2), { from: 0, to: 2, amount: 1 });
});

test('pours the contiguous top portion without exceeding capacity or mutating history', () => {
    const board = [[2, 1, 1], [0, 0, 1], [], [], []];
    const snapshot = structuredClone(board);
    const next = pour(board, getMove(board, 0, 1));
    assert.deepEqual(next, [[2, 1], [0, 0, 1, 1], [], [], []]);
    assert.deepEqual(board, snapshot);
    assert.deepEqual(getMove(board, 0, 2), { from: 0, to: 2, amount: 2 });
});

test('winning requires three full single-color bottles', () => {
    assert.equal(isSorted([0, 0]), false);
    assert.equal(isWon([[0, 0], [1, 1], [2, 2], [], []]), false);
    assert.equal(isWon([[0, 0, 0, 0], [], [1, 1, 1, 1], [], [2, 2, 2, 2]]), true);
});

test('levels are deterministic, conserve portions, and can be solved using legal hints', () => {
    for (let level = 1; level <= 100; level++) {
        const board = createLevel(level);
        assert.deepEqual(board, createLevel(level));
        assert.equal(isWon(board), false);
        assert.equal(board.length, 5);
        for (const color of [0, 1, 2]) assert.equal(board.flat().filter(c => c === color).length, 4);
        assert.deepEqual(board.map(b => b.length), [4, 4, 4, 0, 0]);
        const solution = solve(board);
        assert.ok(solution?.length);
        let current = board;
        for (const move of solution) {
            assert.deepEqual(getMove(current, move.from, move.to), move);
            current = pour(current, move);
        }
        assert.ok(isWon(current));
    }
});

test('solver reports an impossible arrangement and recognizes a completed one', () => {
    assert.equal(solve([[0, 1, 2, 0], [1, 2, 0, 1], [2, 0, 1, 2]]), null);
    assert.deepEqual(solve([[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2], [], []]), []);
});
