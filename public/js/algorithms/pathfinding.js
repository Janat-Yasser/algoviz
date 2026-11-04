/* =============================================
   PATHFINDING VISUALIZER
   Grid-based with Dijkstra, A*, BFS, DFS

   The search runs first as a pure function (computeSearch) that records
   every event; the animation then plays those events back. Editing the grid
   while an animation is playing cancels it cleanly.

   Colours mean the same thing for every algorithm:
     frontier = discovered, waiting to be explored
     visited  = taken off the frontier and explored (this is what we count)
   ============================================= */

const ROWS = 20, COLS = 40;
let walls = [];                 // walls[r][c] === true
let startCell = { r: 10, c: 5 };
let endCell = { r: 10, c: 34 };
let mouseDown = false;
let drawMode = 'wall';
let pfSpeed = 5;
let runId = 0;                  // bumping this cancels any animation in progress
let running = false;

// ── Pure search (no DOM) ───────────────────────
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const key = (r, c) => r * COLS + c;

function neighbors(wallGrid, r, c, rows = ROWS, cols = COLS) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !wallGrid[nr][nc]) out.push([nr, nc]);
  }
  return out;
}

const manhattan = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

// Tiny binary min-heap keyed by priority, with insertion order as a tie-break
// so results are deterministic.
class MinHeap {
  constructor() { this.a = []; this.n = 0; }
  get size() { return this.a.length; }
  push(item, pri) { this.a.push({ item, pri, seq: this.n++ }); this._up(this.a.length - 1); }
  pop() {
    const top = this.a[0], last = this.a.pop();
    if (this.a.length) { this.a[0] = last; this._down(0); }
    return top.item;
  }
  _less(i, j) { const x = this.a[i], y = this.a[j]; return x.pri < y.pri || (x.pri === y.pri && x.seq < y.seq); }
  _up(i) { while (i > 0) { const p = (i - 1) >> 1; if (!this._less(i, p)) break; [this.a[i], this.a[p]] = [this.a[p], this.a[i]]; i = p; } }
  _down(i) {
    for (;;) {
      const l = 2 * i + 1, r = l + 1; let m = i;
      if (l < this.a.length && this._less(l, m)) m = l;
      if (r < this.a.length && this._less(r, m)) m = r;
      if (m === i) return;
      [this.a[i], this.a[m]] = [this.a[m], this.a[i]]; i = m;
    }
  }
}

/**
 * Run a search and record what happens.
 * @returns {{ events: {type:'frontier'|'visit', r:number, c:number}[], path: {r,c}[], found: boolean, visited: number }}
 */
function computeSearch(algo, wallGrid, start, end, rows = ROWS, cols = COLS) {
  const events = [];
  const prev = new Map();
  const seen = new Set([key(start.r, start.c)]);   // discovered
  const done = new Set();                           // explored
  let found = false;

  const visit = (r, c) => { done.add(key(r, c)); events.push({ type: 'visit', r, c }); };
  const discover = (r, c, from) => {
    seen.add(key(r, c));
    prev.set(key(r, c), from);
    events.push({ type: 'frontier', r, c });
  };
  const isEnd = (r, c) => r === end.r && c === end.c;

  if (algo === 'bfs') {
    const queue = [[start.r, start.c]];
    for (let qi = 0; qi < queue.length; qi++) {
      const [r, c] = queue[qi];
      visit(r, c);
      if (isEnd(r, c)) { found = true; break; }
      for (const [nr, nc] of neighbors(wallGrid, r, c, rows, cols)) {
        if (!seen.has(key(nr, nc))) { discover(nr, nc, [r, c]); queue.push([nr, nc]); }
      }
    }
  } else if (algo === 'dfs') {
    // True depth-first: a cell is explored when popped, and we always dive into
    // the most recently discovered branch first.
    const stack = [[start.r, start.c, null]];
    while (stack.length) {
      const [r, c, from] = stack.pop();
      const k = key(r, c);
      if (done.has(k)) continue;
      if (from) prev.set(k, from);
      visit(r, c);
      if (isEnd(r, c)) { found = true; break; }
      const nbs = neighbors(wallGrid, r, c, rows, cols).filter(([nr, nc]) => !done.has(key(nr, nc)));
      for (let i = nbs.length - 1; i >= 0; i--) {
        const [nr, nc] = nbs[i];
        if (!seen.has(key(nr, nc))) { seen.add(key(nr, nc)); events.push({ type: 'frontier', r: nr, c: nc }); }
        stack.push([nr, nc, [r, c]]);
      }
    }
  } else {
    // Dijkstra (h = 0) and A* (h = Manhattan distance) share one implementation.
    const useH = algo === 'astar';
    const g = new Map([[key(start.r, start.c), 0]]);
    const open = new MinHeap();
    open.push([start.r, start.c], useH ? manhattan(start, end) : 0);
    while (open.size) {
      const [r, c] = open.pop();
      const k = key(r, c);
      if (done.has(k)) continue;              // stale heap entry
      visit(r, c);
      if (isEnd(r, c)) { found = true; break; }
      for (const [nr, nc] of neighbors(wallGrid, r, c, rows, cols)) {
        const nk = key(nr, nc);
        if (done.has(nk)) continue;
        const cand = g.get(k) + 1;
        if (cand < (g.has(nk) ? g.get(nk) : Infinity)) {
          g.set(nk, cand);
          if (!seen.has(nk)) discover(nr, nc, [r, c]); else prev.set(nk, [r, c]);
          open.push([nr, nc], cand + (useH ? manhattan({ r: nr, c: nc }, end) : 0));
        }
      }
    }
  }

  const path = [];
  if (found) {
    let cur = [end.r, end.c];
    while (cur && !(cur[0] === start.r && cur[1] === start.c)) {
      path.unshift({ r: cur[0], c: cur[1] });
      cur = prev.get(key(cur[0], cur[1]));
    }
  }
  return { events, path, found, visited: done.size };
}

// ── Grid + DOM ─────────────────────────────────
function initGrid() {
  walls = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  renderGrid();
}

function renderGrid() {
  const el = document.getElementById('pfGrid');
  if (!el) return;
  el.style.gridTemplateColumns = `repeat(${COLS}, 24px)`;
  el.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.dataset.r = r;
      cell.dataset.c = c;
      updateCellClass(cell, r, c);
      cell.addEventListener('mousedown', () => { mouseDown = true; handleCellInteract(r, c); });
      cell.addEventListener('mouseenter', () => { if (mouseDown) handleCellInteract(r, c); });
      el.appendChild(cell);
    }
  }
}

function updateCellClass(cell, r, c) {
  cell.className = 'pf-cell';
  if (r === startCell.r && c === startCell.c) cell.classList.add('start');
  else if (r === endCell.r && c === endCell.c) cell.classList.add('end');
  else if (walls[r][c]) cell.classList.add('wall');
}

function getCellEl(r, c) {
  const el = document.getElementById('pfGrid');
  return el ? el.children[r * COLS + c] : null;
}

const isStartOrEnd = (r, c) => (r === startCell.r && c === startCell.c) || (r === endCell.r && c === endCell.c);

function handleCellInteract(r, c) {
  cancelRun();
  if (drawMode === 'wall') {
    if (isStartOrEnd(r, c)) return;
    walls[r][c] = !walls[r][c];
    updateCellClass(getCellEl(r, c), r, c);
  } else {
    if (drawMode === 'start' && !(r === endCell.r && c === endCell.c)) startCell = { r, c };
    if (drawMode === 'end' && !(r === startCell.r && c === startCell.c)) endCell = { r, c };
    walls[r][c] = false;
    renderGrid();
    setMode('wall');
  }
}

function setMode(mode) {
  drawMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1))?.classList.add('active');
}

const EXPLAIN = {
  bfs: 'BFS explores layer by layer using a queue — guarantees the shortest path in an unweighted grid.',
  dfs: 'DFS dives as deep as it can down one branch before backtracking (a stack) — it does NOT guarantee the shortest path.',
  dijkstra: "Dijkstra's always explores the closest unexplored cell (a priority queue). On this grid every step costs 1, so it spreads like BFS; with weighted cells it would still find the cheapest path.",
  astar: 'A* is Dijkstra plus a heuristic (Manhattan distance to the goal) that pulls the search toward the target — same shortest path, usually far fewer cells explored.',
};

function cancelRun() {
  if (!running) return;
  runId++;
  running = false;
  clearPathVisuals();
  document.getElementById('pfStatus').textContent = 'Draw walls, then Visualize';
}

async function runPathfinding() {
  cancelRun();
  clearPath();
  const myRun = ++runId;
  running = true;
  const cancelled = () => myRun !== runId;
  const delay = () => new Promise(res => setTimeout(res, Math.max(2, 60 - pfSpeed * 6)));

  document.getElementById('pfStatus').textContent = 'Running...';
  explain(EXPLAIN[PF_ALGO] || '');

  const result = computeSearch(PF_ALGO, walls, startCell, endCell);
  let visitedShown = 0;

  for (const ev of result.events) {
    if (cancelled()) return;
    if (!isStartOrEnd(ev.r, ev.c)) {
      const el = getCellEl(ev.r, ev.c);
      if (el) {
        if (ev.type === 'frontier') el.classList.add('frontier');
        else { el.classList.remove('frontier'); el.classList.add('visited'); }
      }
    }
    if (ev.type === 'visit') {
      visitedShown++;
      document.getElementById('pfVisited').textContent = visitedShown;
      await delay();
    }
  }

  if (result.found) {
    document.getElementById('pfPath').textContent = result.path.length;
    for (const { r, c } of result.path) {
      if (cancelled()) return;
      if (isStartOrEnd(r, c)) continue;
      const el = getCellEl(r, c);
      if (el) { el.classList.remove('visited', 'frontier'); el.classList.add('path'); }
      await new Promise(res => setTimeout(res, 30));
    }
    document.getElementById('pfStatus').textContent = `✅ Path found! Length: ${result.path.length}`;
    explain(`✅ Path found! Explored ${result.visited} cells, path length = ${result.path.length}.`);
  } else {
    document.getElementById('pfStatus').textContent = '❌ No path found!';
    explain('❌ No path found — the destination is walled off.');
  }
  running = false;
}

function clearPathVisuals() {
  const el = document.getElementById('pfGrid');
  if (el) for (const cell of el.children) cell.classList.remove('visited', 'path', 'frontier');
}

function clearPath() {
  cancelRun();
  clearPathVisuals();
  document.getElementById('pfVisited').textContent = '0';
  document.getElementById('pfPath').textContent = '0';
  document.getElementById('pfStatus').textContent = 'Draw walls, then Visualize';
}

function clearGrid() {
  cancelRun();
  initGrid();
  document.getElementById('pfVisited').textContent = '0';
  document.getElementById('pfPath').textContent = '0';
  document.getElementById('pfStatus').textContent = 'Draw walls, then Visualize';
  explain('Grid cleared. Click to draw walls, then press Visualize.');
}

function generateMaze() {
  clearGrid();
  // Random obstacles (30% of cells). Not every random maze has a path, which is
  // a good way to see each algorithm prove "no path" too.
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.3 && !isStartOrEnd(r, c)) walls[r][c] = true;
  renderGrid();
  explain('Random maze generated! Press Visualize to find the path.');
}

function updatePfSpeed(val) {
  pfSpeed = parseInt(val, 10);
  document.getElementById('pfSpeedVal').textContent = val;
}

function explain(text) {
  const el = document.getElementById('pfExplanationText');
  if (el) el.innerHTML = text;
}

// (exported for unit tests under Node; the browser ignores this)
if (typeof module !== 'undefined') module.exports = { computeSearch, MinHeap };
if (typeof document !== 'undefined') {
  document.addEventListener('mouseup', () => { mouseDown = false; }); // registered once
  document.addEventListener('DOMContentLoaded', initGrid);
}
