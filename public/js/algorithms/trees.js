/* =============================================
   BINARY SEARCH TREE VISUALIZER
   SVG-based with animated insert/delete/search
   ============================================= */

class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

class BST {
  constructor() { this.root = null; }

  insert(val) {
    const node = new BSTNode(val);
    if (!this.root) { this.root = node; return [{ type: 'insert', val, path: [] }]; }
    const steps = [];
    let cur = this.root, path = [];
    while (cur) {
      path.push(cur.val);
      if (val === cur.val) { steps.push({ type: 'found', val, path: [...path] }); return steps; }
      if (val < cur.val) {
        steps.push({ type: 'goLeft', val, cur: cur.val, path: [...path] });
        if (!cur.left) { cur.left = node; steps.push({ type: 'insert', val, path: [...path] }); break; }
        cur = cur.left;
      } else {
        steps.push({ type: 'goRight', val, cur: cur.val, path: [...path] });
        if (!cur.right) { cur.right = node; steps.push({ type: 'insert', val, path: [...path] }); break; }
        cur = cur.right;
      }
    }
    return steps;
  }

  search(val) {
    const steps = [];
    let cur = this.root, path = [];
    while (cur) {
      path.push(cur.val);
      if (val === cur.val) { steps.push({ type: 'found', val, path: [...path] }); return steps; }
      if (val < cur.val) {
        steps.push({ type: 'goLeft', val, cur: cur.val, path: [...path] });
        cur = cur.left;
      } else {
        steps.push({ type: 'goRight', val, cur: cur.val, path: [...path] });
        cur = cur.right;
      }
    }
    steps.push({ type: 'notFound', val, path: [...path] });
    return steps;
  }

  delete(val) {
    const steps = [];
    this.root = this._delete(this.root, val, steps, []);
    return steps;
  }

  _delete(node, val, steps, path) {
    if (!node) { steps.push({ type: 'notFound', val, path: [...path] }); return null; }
    path.push(node.val);
    if (val < node.val) {
      steps.push({ type: 'goLeft', val, cur: node.val, path: [...path] });
      node.left = this._delete(node.left, val, steps, [...path]);
    } else if (val > node.val) {
      steps.push({ type: 'goRight', val, cur: node.val, path: [...path] });
      node.right = this._delete(node.right, val, steps, [...path]);
    } else {
      steps.push({ type: 'delete', val, path: [...path] });
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let minNode = node.right;
      while (minNode.left) minNode = minNode.left;
      steps.push({ type: 'replaceWith', val: minNode.val, path: [...path] });
      node.val = minNode.val;
      node.right = this._delete(node.right, minNode.val, steps, [...path]);
    }
    return node;
  }

  // Deep copy, so an operation can be "previewed" without touching the visible tree.
  clone() {
    const copy = (n) => {
      if (!n) return null;
      const m = new BSTNode(n.val);
      m.left = copy(n.left);
      m.right = copy(n.right);
      return m;
    };
    const t = new BST();
    t.root = copy(this.root);
    return t;
  }

  height(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  size(node = this.root) {
    if (!node) return 0;
    return 1 + this.size(node.left) + this.size(node.right);
  }

  inorder(node = this.root, res = []) {
    if (!node) return res;
    this.inorder(node.left, res);
    res.push(node.val);
    this.inorder(node.right, res);
    return res;
  }

  preorder(node = this.root, res = []) {
    if (!node) return res;
    res.push(node.val);
    this.preorder(node.left, res);
    this.preorder(node.right, res);
    return res;
  }

  postorder(node = this.root, res = []) {
    if (!node) return res;
    this.postorder(node.left, res);
    this.postorder(node.right, res);
    res.push(node.val);
    return res;
  }
}

// ── Layout ─────────────────────────────────────
function treeHeight(n) { return n ? 1 + Math.max(treeHeight(n.left), treeHeight(n.right)) : 0; }

function computeLayout(root) {
  if (!root) return;
  let counter = 0;
  function assignX(node) {
    if (!node) return;
    assignX(node.left);
    node.xIdx = counter++;
    assignX(node.right);
  }
  assignX(root);

  const svgEl = document.getElementById('treeSvg');
  const box = svgEl && svgEl.parentElement ? (svgEl.parentElement.clientWidth - 32) || 900 : 900; // minus padding
  const total = counter;
  const MIN_STEP = 48;                       // node diameter (44) + a little air
  const xStep = Math.max(MIN_STEP, Math.min(60, box / (total + 1)));
  const yStep = 70;
  // If the tree is wider/taller than the box, enlarge the SVG (its container scrolls)
  // instead of letting nodes overlap.
  const W = Math.max(box, xStep * total + 40);
  const H = Math.max(500, 40 + (root ? treeHeight(root) : 1) * yStep + 20);
  if (svgEl) { svgEl.setAttribute('width', W); svgEl.setAttribute('height', H); }
  const startX = (W - xStep * total) / 2;

  function assignPos(node, depth) {
    if (!node) return;
    node.x = startX + node.xIdx * xStep + xStep / 2;
    node.y = 40 + depth * yStep;
    assignPos(node.left, depth + 1);
    assignPos(node.right, depth + 1);
  }
  assignPos(root, 0);
}

// ── SVG Render ─────────────────────────────────
function renderTree(highlightPath = [], highlightType = '') {
  const svg = document.getElementById('treeSvg');
  if (!svg) return;
  svg.innerHTML = '';

  if (!bst.root) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#A1A1A6');
    text.setAttribute('font-size', '14');
    text.textContent = 'Empty tree. Insert a value, or press Random tree.';
    svg.appendChild(text);
    return;
  }

  computeLayout(bst.root);
  const NODE_R = 22;

  // Draw edges first
  function drawEdges(node) {
    if (!node) return;
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', node.left.x);
      line.setAttribute('y2', node.left.y);
      line.setAttribute('class', 'tree-edge');
      const isHighlighted = highlightPath.includes(node.val) && highlightPath.includes(node.left.val);
      if (isHighlighted) { line.setAttribute('stroke', '#7B8CFF'); line.setAttribute('stroke-width', '3'); }
      svg.appendChild(line);
      drawEdges(node.left);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', node.right.x);
      line.setAttribute('y2', node.right.y);
      line.setAttribute('class', 'tree-edge');
      const isHighlighted = highlightPath.includes(node.val) && highlightPath.includes(node.right.val);
      if (isHighlighted) { line.setAttribute('stroke', '#7B8CFF'); line.setAttribute('stroke-width', '3'); }
      svg.appendChild(line);
      drawEdges(node.right);
    }
  }

  // Draw nodes
  function drawNodes(node) {
    if (!node) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'tree-node');
    g.setAttribute('transform', `translate(${node.x},${node.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_R);

    const isInPath = highlightPath.includes(node.val);
    const isLast = highlightPath[highlightPath.length - 1] === node.val;

    if (isLast && highlightType === 'found') {
      circle.setAttribute('fill', '#5FD3A2');
      circle.setAttribute('stroke', '#5FD3A2');
    } else if (isLast && highlightType === 'notFound') {
      circle.setAttribute('fill', '#FF8577');
      circle.setAttribute('stroke', '#FF8577');
    } else if (isLast && (highlightType === 'insert' || highlightType === 'delete')) {
      circle.setAttribute('fill', '#7B8CFF');
      circle.setAttribute('stroke', '#7B8CFF');
    } else if (isInPath) {
      circle.setAttribute('fill', '#FFC85C');
      circle.setAttribute('stroke', '#FFC85C');
    } else {
      circle.setAttribute('fill', '#FFFFFF');
      circle.setAttribute('stroke', '#D7DBE3');
    }
    circle.setAttribute('stroke-width', '2');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dy', '5');
    text.setAttribute('fill', isLast && (highlightType === 'insert' || highlightType === 'delete') ? '#FFFFFF' : '#1D1D1F');
    text.setAttribute('font-size', node.val >= 100 ? '10' : '13');
    text.setAttribute('font-family', 'Inter, sans-serif');
    text.setAttribute('font-weight', '600');
    text.textContent = node.val;

    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
    drawNodes(node.left);
    drawNodes(node.right);
  }

  // Adjust SVG height
  const h = bst.height();
  const neededH = Math.max(400, 80 + h * 70);
  svg.setAttribute('height', neededH);

  drawEdges(bst.root);
  drawNodes(bst.root);
}

// ── BST Code Snippets ──────────────────────────
const BST_CODES = {
  insert: [
    'function insert(val) {',
    '  if (!root) { root = new Node(val); return; }',
    '  let cur = root;',
    '  while (cur) {',
    '    if (val < cur.val) {      // go left',
    '      if (!cur.left) { cur.left = new Node(val); break; }',
    '      cur = cur.left;',
    '    } else {                  // go right',
    '      if (!cur.right) { cur.right = new Node(val); break; }',
    '      cur = cur.right;',
    '    }',
    '  }',
    '}'
  ],
  search: [
    'function search(val) {',
    '  let cur = root;',
    '  while (cur) {',
    '    if (val === cur.val) return cur;  // found!',
    '    if (val < cur.val)',
    '      cur = cur.left;   // go left',
    '    else',
    '      cur = cur.right;  // go right',
    '  }',
    '  return null;  // not found',
    '}'
  ],
  delete: [
    'function delete(val) {',
    '  root = _delete(root, val);',
    '}',
    'function _delete(node, val) {',
    '  if (!node) return null;',
    '  if (val < node.val)',
    '    node.left = _delete(node.left, val);',
    '  else if (val > node.val)',
    '    node.right = _delete(node.right, val);',
    '  else {                    // found node to delete',
    '    if (!node.left) return node.right;',
    '    if (!node.right) return node.left;',
    '    let min = findMin(node.right); // in-order successor',
    '    node.val = min.val;',
    '    node.right = _delete(node.right, min.val);',
    '  }',
    '  return node;',
    '}'
  ]
};

function renderBSTCode(op, activeLine = -1) {
  const lines = BST_CODES[op] || [];
  const el = document.getElementById('bstCodeLines');
  if (!el) return;
  el.innerHTML = lines.map((line, i) =>
    `<span class="code-line ${i === activeLine ? 'active' : ''}" id="bst-code-${i}">${escHtml(line)}</span>`
  ).join('\n');
  document.getElementById('bstCodeTitle').textContent = `${op.charAt(0).toUpperCase() + op.slice(1)} algorithm`;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── State ──────────────────────────────────────
const bst = new BST();
let stepQueue = [];
let isAnimating = false;

function updateStats() {
  document.getElementById('bstNodeCount').textContent = bst.size();
  document.getElementById('bstHeight').textContent = bst.height();
}

// ── Explanation messages ────────────────────────
const EXPLANATIONS = {
  goLeft: (s) => `Node ${s.cur}: ${s.val} < ${s.cur}, so go <strong>left</strong>.`,
  goRight: (s) => `Node ${s.cur}: ${s.val} > ${s.cur}, so go <strong>right</strong>.`,
  insert: (s) => `Inserted <strong>${s.val}</strong> into the tree.`,
  found: (s) => `Found <strong>${s.val}</strong> in the tree after ${s.path.length} step(s).`,
  notFound: (s) => `<strong>${s.val}</strong> isn't in the tree: the search fell off a leaf.`,
  delete: (s) => `Deleting node <strong>${s.val}</strong>...`,
  replaceWith: (s) => `Replacing deleted node with in-order successor <strong>${s.val}</strong>.`
};

const CODE_LINE_MAP = {
  goLeft: { insert: 4, search: 4, delete: 5 },
  goRight: { insert: 7, search: 6, delete: 7 },
  insert: { insert: 5 },
  found: { search: 3 },
  notFound: { search: 9 },
  delete: { delete: 9 },
  replaceWith: { delete: 12 }
};

let animToken = 0;

// Plays the steps on the CURRENT tree, then swaps in the changed tree at the moment
// the change happens (the insert/delete step), so the animation tells the truth.
async function animateSteps(steps, op, nextTree = null) {
  if (isAnimating) return;
  isAnimating = true;
  const myToken = ++animToken;
  let committed = false;
  const commit = () => { if (nextTree && !committed) { bst.root = nextTree.root; committed = true; } };
  renderBSTCode(op);
  document.getElementById('bstSteps').textContent = steps.length;

  for (let i = 0; i < steps.length; i++) {
    if (myToken !== animToken) return; // cancelled (e.g. Clear)
    const step = steps[i];
    // The tree visibly changes on the step where the node is inserted, or after the
    // delete/replace has been explained.
    if (step.type === 'insert') commit();
    const codeLine = CODE_LINE_MAP[step.type]?.[op] ?? -1;

    // Highlight code
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    const lineEl = document.getElementById(`bst-code-${codeLine}`);
    if (lineEl) { lineEl.classList.add('active'); lineEl.scrollIntoView({ block: 'nearest' }); }

    // Determine highlight type
    let hlType = step.type;
    if (step.type === 'goLeft' || step.type === 'goRight') hlType = 'path';

    renderTree(step.path, hlType === 'path' ? '' : step.type);
    updateStats();

    const explFn = EXPLANATIONS[step.type];
    if (explFn) {
      document.getElementById('bstExplanationText').innerHTML = explFn(step);
    }
    document.getElementById('bstStatus').textContent = `Step ${i + 1} / ${steps.length}`;
    await new Promise(res => setTimeout(res, 420));
    if (step.type === 'delete' || step.type === 'replaceWith') {
      // show the result of the delete straight after its explanation
      if (steps.slice(i + 1).every(s => s.type !== 'goLeft' && s.type !== 'goRight')) commit();
    }
  }
  if (myToken !== animToken) return;
  commit();

  renderTree(steps[steps.length - 1]?.path || [], steps[steps.length - 1]?.type || '');
  updateStats();
  isAnimating = false;
}

// ── Public ops ─────────────────────────────────
function bstInsert() {
  const inp = document.getElementById('bstInput');
  const val = parseInt(inp.value);
  if (isNaN(val) || val < 1 || val > 999) return;
  if (isAnimating) return;
  inp.value = '';
  const next = bst.clone();
  const steps = next.insert(val);
  animateSteps(steps, 'insert', next);
}

function bstSearch() {
  const inp = document.getElementById('bstSearchInput');
  const val = parseInt(inp.value);
  if (isNaN(val)) return;
  if (isAnimating) return;
  inp.value = '';
  const steps = bst.search(val);
  animateSteps(steps, 'search');
}

function bstDelete() {
  const inp = document.getElementById('bstDeleteInput');
  const val = parseInt(inp.value);
  if (isNaN(val)) return;
  if (isAnimating) return;
  inp.value = '';
  const next = bst.clone();
  const steps = next.delete(val);
  animateSteps(steps, 'delete', next);
}

function stopAnimation() {
  animToken++;
  isAnimating = false;
}

function bstRandom() {
  stopAnimation();
  bst.root = null;
  const count = 10 + Math.floor(Math.random() * 5);
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let v;
    do { v = Math.floor(Math.random() * 90) + 5; } while (used.has(v));
    used.add(v);
    bst.insert(v);
  }
  renderTree();
  updateStats();
  document.getElementById('bstExplanationText').innerHTML = `Random tree with <strong>${count} nodes</strong> generated. Try searching or deleting!`;
  renderBSTCode('insert');
}

function bstClear() {
  stopAnimation();
  bst.root = null;
  renderTree();
  updateStats();
  document.getElementById('bstExplanationText').innerHTML = 'Tree cleared. Enter a number and press <strong>Insert</strong>.';
  document.getElementById('bstStatus').textContent = 'Insert a value to begin';
  document.getElementById('bstSteps').textContent = '0';
}

function bstTraverse(type) {
  let result = [];
  if (type === 'inorder') result = bst.inorder();
  else if (type === 'preorder') result = bst.preorder();
  else if (type === 'postorder') result = bst.postorder();

  const el = document.getElementById('traversalResult');
  el.textContent = result.join(' → ');

  const descs = {
    inorder: 'Inorder (Left → Root → Right) gives <strong>sorted</strong> output for a BST.',
    preorder: 'Preorder (Root → Left → Right) — useful for <strong>copying</strong> the tree.',
    postorder: 'Postorder (Left → Right → Root) — useful for <strong>deleting</strong> the tree.'
  };
  document.getElementById('bstExplanationText').innerHTML = descs[type];
}

// (exported for unit tests under Node; the browser ignores this)
if (typeof module !== 'undefined') module.exports = { BST, BSTNode };

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  renderTree();
  renderBSTCode('insert');
  updateStats();

  // Enter key on inputs
  document.getElementById('bstInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') bstInsert(); });
  document.getElementById('bstSearchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') bstSearch(); });
  document.getElementById('bstDeleteInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') bstDelete(); });
});
