const test = require('node:test');
const assert = require('node:assert/strict');
const { generateSteps, CODE_LINES } = require('../public/js/algorithms/sorting');
const { computeSearch } = require('../public/js/algorithms/pathfinding');
const { BST } = require('../public/js/algorithms/trees');
const { algorithms } = require('../models/Algorithm');

const rand = (n, seed = 7) => { let x = seed; return Array.from({ length: n }, () => (x = (x * 9301 + 49297) % 233280) % 95 + 5); };
const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v);

// ── Sorting ────────────────────────────────────
for (const id of ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap']) {
  test(`${id} sort ends sorted and every step references a real code line`, () => {
    for (const arr of [rand(30), rand(1), [], [5, 5, 5], [9, 8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4]]) {
      const steps = generateSteps(arr, id);
      if (!arr.length) continue;
      const last = steps[steps.length - 1];
      assert.ok(isSorted(last.arr), `${id} not sorted: ${last.arr}`);
      assert.deepEqual([...last.arr].sort((a, b) => a - b), [...arr].sort((a, b) => a - b), 'elements lost');
      for (const s of steps) assert.ok(s.codeLine < CODE_LINES[id].length, `${id} codeLine ${s.codeLine} out of range`);
    }
  });
}

test('bubble sort stops early on already-sorted input (best case is really O(n))', () => {
  const steps = generateSteps([1, 2, 3, 4, 5, 6, 7, 8], 'bubble');
  const comparisons = steps.filter((s) => s.comparing.length).length;
  assert.equal(comparisons, 7); // one pass of n-1 comparisons, then stop
});

test('the complexity labels match the code we show', () => {
  const bubble = algorithms.sorting.find((a) => a.id === 'bubble');
  assert.equal(bubble.complexity.time.best, 'O(n)');
  assert.match(bubble.code, /swapped/);
});

test('merge sort only marks bars green (final) at the very end', () => {
  const steps = generateSteps(rand(16), 'merge');
  const firstGreen = steps.findIndex((s) => s.sorted.length > 0);
  assert.ok(firstGreen >= steps.length - 2, `green appeared at step ${firstGreen}/${steps.length}`);
});

// ── Pathfinding ────────────────────────────────
const grid = (rows, cols, wallsList = []) => {
  const g = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (const [r, c] of wallsList) g[r][c] = true;
  return g;
};

test('BFS, Dijkstra and A* find the same shortest path length', () => {
  const w = grid(10, 10, [[4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8]]);
  const S = { r: 0, c: 0 }, E = { r: 9, c: 9 };
  const lens = ['bfs', 'dijkstra', 'astar'].map((a) => computeSearch(a, w, S, E, 10, 10).path.length);
  assert.ok(lens.every((l) => l === lens[0]), lens.join(','));
  assert.equal(lens[0], 18);
});

test('A* explores no more cells than Dijkstra on an open grid', () => {
  const w = grid(20, 40), S = { r: 10, c: 5 }, E = { r: 10, c: 34 };
  const d = computeSearch('dijkstra', w, S, E, 20, 40);
  const a = computeSearch('astar', w, S, E, 20, 40);
  assert.ok(a.visited < d.visited, `astar ${a.visited} vs dijkstra ${d.visited}`);
});

test('DFS finds a path (not necessarily shortest) and every algorithm reports no-path correctly', () => {
  const w = grid(5, 5, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]]); // wall splits the grid
  for (const a of ['bfs', 'dfs', 'dijkstra', 'astar']) {
    const r = computeSearch(a, w, { r: 0, c: 0 }, { r: 0, c: 4 }, 5, 5);
    assert.equal(r.found, false, a);
    assert.equal(r.path.length, 0, a);
  }
  const ok = computeSearch('dfs', grid(5, 5), { r: 0, c: 0 }, { r: 4, c: 4 }, 5, 5);
  assert.ok(ok.found && ok.path.length >= 8);
});

test('a returned path is connected, avoids walls and ends at the target', () => {
  const w = grid(12, 12, [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10]]);
  for (const a of ['bfs', 'dfs', 'dijkstra', 'astar']) {
    const { path } = computeSearch(a, w, { r: 0, c: 0 }, { r: 11, c: 0 }, 12, 12);
    let prev = { r: 0, c: 0 };
    for (const p of path) {
      assert.equal(Math.abs(p.r - prev.r) + Math.abs(p.c - prev.c), 1, `${a} jump`);
      assert.equal(w[p.r][p.c], false, `${a} through wall`);
      prev = p;
    }
    assert.deepEqual(prev, { r: 11, c: 0 });
  }
});

// ── BST ────────────────────────────────────────
test('BST insert/delete keep the BST property; clone is independent', () => {
  const t = new BST();
  for (const v of [50, 30, 70, 20, 40, 60, 80, 35, 45, 65]) t.insert(v);
  const c = t.clone();
  c.delete(30); // node with two children
  c.delete(80); // leaf
  c.delete(70); // one child
  assert.deepEqual(t.inorder(), [20, 30, 35, 40, 45, 50, 60, 65, 70, 80], 'original changed');
  assert.deepEqual(c.inorder(), [20, 35, 40, 45, 50, 60, 65]);
  assert.equal(c.search(30).at(-1).type, 'notFound');
  assert.equal(c.search(65).at(-1).type, 'found');
});
