/* =============================================
   PATHFINDING VISUALIZER
   Grid-based with Dijkstra, A*, BFS, DFS
   ============================================= */

const ROWS = 20, COLS = 40;
let grid = [];
let startCell = { r: 10, c: 5 };
let endCell = { r: 10, c: 34 };
let mouseDown = false;
let drawMode = 'wall';
let pfSpeed = 5;
let running = false;

// ── Grid init ──────────────────────────────────
function initGrid() {
  grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      r, c,
      wall: false,
      visited: false,
      path: false,
      g: Infinity, h: 0, f: Infinity,
      dist: Infinity,
      prev: null
    }))
  );
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
      cell.className = 'pf-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      updateCellClass(cell, r, c);
      cell.addEventListener('mousedown', (e) => { mouseDown = true; handleCellInteract(r, c); });
      cell.addEventListener('mouseenter', () => { if (mouseDown) handleCellInteract(r, c); });
      cell.addEventListener('mouseup', () => { mouseDown = false; });
      el.appendChild(cell);
    }
  }
  document.addEventListener('mouseup', () => { mouseDown = false; });
}

function updateCellClass(cell, r, c) {
  const node = grid[r][c];
  cell.className = 'pf-cell';
  if (r === startCell.r && c === startCell.c) cell.classList.add('start');
  else if (r === endCell.r && c === endCell.c) cell.classList.add('end');
  else if (node.wall) cell.classList.add('wall');
  else if (node.path) cell.classList.add('path');
  else if (node.visited) cell.classList.add('visited');
}

function getCellEl(r, c) {
  return document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}

function handleCellInteract(r, c) {
  if (drawMode === 'wall') {
    if ((r === startCell.r && c === startCell.c) || (r === endCell.r && c === endCell.c)) return;
    grid[r][c].wall = !grid[r][c].wall;
    const el = getCellEl(r, c);
    if (el) updateCellClass(el, r, c);
  } else if (drawMode === 'start') {
    const old = getCellEl(startCell.r, startCell.c);
    startCell = { r, c };
    grid[r][c].wall = false;
    if (old) updateCellClass(old, startCell.r, startCell.c);
    const el = getCellEl(r, c);
    if (el) el.className = 'pf-cell start';
    setMode('wall');
  } else if (drawMode === 'end') {
    endCell = { r, c };
    grid[r][c].wall = false;
    renderGrid();
    setMode('wall');
  }
}

function setMode(mode) {
  drawMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1))?.classList.add('active');
}

// ── Algorithms ─────────────────────────────────
function getNeighbors(r, c) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  return dirs
    .map(([dr, dc]) => [r+dr, c+dc])
    .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc].wall)
    .map(([nr, nc]) => grid[nr][nc]);
}

function heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

async function runPathfinding() {
  if (running) return;
  clearPath();
  running = true;
  document.getElementById('pfStatus').textContent = 'Running...';
  document.getElementById('pfVisited').textContent = '0';
  document.getElementById('pfPath').textContent = '0';

  const delay = () => new Promise(res => setTimeout(res, Math.max(2, 60 - pfSpeed * 6)));
  let visitedCount = 0;
  const startNode = grid[startCell.r][startCell.c];
  const endNode = grid[endCell.r][endCell.c];

  // Reset grid state
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      grid[r][c].visited = false;
      grid[r][c].path = false;
      grid[r][c].prev = null;
      grid[r][c].dist = Infinity;
      grid[r][c].g = Infinity;
      grid[r][c].f = Infinity;
    }

  let found = false;

  if (PF_ALGO === 'bfs') {
    const queue = [startNode];
    startNode.visited = true;
    explain('BFS explores layer by layer using a queue — guarantees shortest path in unweighted graphs.');
    while (queue.length > 0) {
      const node = queue.shift();
      if (node === endNode) { found = true; break; }
      for (const nb of getNeighbors(node.r, node.c)) {
        if (!nb.visited) {
          nb.visited = true;
          nb.prev = node;
          queue.push(nb);
          visitedCount++;
          document.getElementById('pfVisited').textContent = visitedCount;
          const el = getCellEl(nb.r, nb.c);
          if (el && !(nb.r === endCell.r && nb.c === endCell.c)) el.classList.add('visited');
          await delay();
        }
      }
    }
  }

  else if (PF_ALGO === 'dfs') {
    const stack = [startNode];
    startNode.visited = true;
    explain('DFS dives deep using a stack — does NOT guarantee shortest path.');
    while (stack.length > 0) {
      const node = stack.pop();
      if (node === endNode) { found = true; break; }
      for (const nb of getNeighbors(node.r, node.c)) {
        if (!nb.visited) {
          nb.visited = true;
          nb.prev = node;
          stack.push(nb);
          visitedCount++;
          document.getElementById('pfVisited').textContent = visitedCount;
          const el = getCellEl(nb.r, nb.c);
          if (el && !(nb.r === endCell.r && nb.c === endCell.c)) el.classList.add('visited');
          await delay();
        }
      }
    }
  }

  else if (PF_ALGO === 'dijkstra') {
    startNode.dist = 0;
    const unvisited = new Set();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) unvisited.add(grid[r][c]);
    explain("Dijkstra's explores by minimum distance — guarantees shortest path even in weighted graphs.");
    while (unvisited.size > 0) {
      let node = [...unvisited].reduce((a, b) => a.dist < b.dist ? a : b);
      if (node.dist === Infinity) break;
      unvisited.delete(node);
      if (node === endNode) { found = true; break; }
      for (const nb of getNeighbors(node.r, node.c)) {
        const alt = node.dist + 1;
        if (alt < nb.dist) {
          nb.dist = alt;
          nb.prev = node;
          nb.visited = true;
          visitedCount++;
          document.getElementById('pfVisited').textContent = visitedCount;
          const el = getCellEl(nb.r, nb.c);
          if (el && !(nb.r === endCell.r && nb.c === endCell.c)) el.classList.add('visited');
          await delay();
        }
      }
    }
  }

  else if (PF_ALGO === 'astar') {
    startNode.g = 0;
    startNode.h = heuristic(startNode, endNode);
    startNode.f = startNode.h;
    const openSet = [startNode];
    const closedSet = new Set();
    explain('A* uses a heuristic (Manhattan distance) to guide search — faster than Dijkstra for single targets.');
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const node = openSet.shift();
      if (node === endNode) { found = true; break; }
      closedSet.add(node);
      node.visited = true;
      visitedCount++;
      document.getElementById('pfVisited').textContent = visitedCount;
      const el = getCellEl(node.r, node.c);
      if (el && !(node.r === startCell.r && node.c === startCell.c) && !(node.r === endCell.r && node.c === endCell.c)) el.classList.add('visited');
      await delay();
      for (const nb of getNeighbors(node.r, node.c)) {
        if (closedSet.has(nb)) continue;
        const gNew = node.g + 1;
        if (gNew < nb.g) {
          nb.g = gNew;
          nb.h = heuristic(nb, endNode);
          nb.f = nb.g + nb.h;
          nb.prev = node;
          if (!openSet.includes(nb)) openSet.push(nb);
        }
      }
    }
  }

  if (found) {
    // Trace path
    let path = [];
    let cur = endNode;
    while (cur && cur !== startNode) { path.unshift(cur); cur = cur.prev; }
    document.getElementById('pfPath').textContent = path.length;
    for (const node of path) {
      if (node === endNode) continue;
      const el = getCellEl(node.r, node.c);
      if (el) { el.classList.remove('visited'); el.classList.add('path'); }
      await new Promise(res => setTimeout(res, 30));
    }
    document.getElementById('pfStatus').textContent = `✅ Path found! Length: ${path.length}`;
    explain(`✅ Path found! Visited ${visitedCount} cells, path length = ${path.length}.`);
  } else {
    document.getElementById('pfStatus').textContent = '❌ No path found!';
    explain('❌ No path found — the destination is blocked by walls.');
  }
  running = false;
}

function clearPath() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].visited = false;
      grid[r][c].path = false;
      grid[r][c].prev = null;
      const el = getCellEl(r, c);
      if (el) { el.classList.remove('visited', 'path', 'frontier'); }
    }
  }
  document.getElementById('pfVisited').textContent = '0';
  document.getElementById('pfPath').textContent = '0';
  document.getElementById('pfStatus').textContent = 'Draw walls, then Visualize';
}

function clearGrid() {
  running = false;
  initGrid();
  document.getElementById('pfVisited').textContent = '0';
  document.getElementById('pfPath').textContent = '0';
  document.getElementById('pfStatus').textContent = 'Draw walls, then Visualize';
  explain('Grid cleared. Click to draw walls, then press Visualize.');
}

function generateMaze() {
  clearGrid();
  // Recursive division maze
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.3 && !(r === startCell.r && c === startCell.c) && !(r === endCell.r && c === endCell.c))
        grid[r][c].wall = true;
  renderGrid();
  explain('Random maze generated! Press Visualize to find the path.');
}

function updatePfSpeed(val) {
  pfSpeed = parseInt(val);
  document.getElementById('pfSpeedVal').textContent = val;
}

function explain(text) {
  const el = document.getElementById('pfExplanationText');
  if (el) el.innerHTML = text;
}

document.addEventListener('DOMContentLoaded', initGrid);
