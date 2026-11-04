/* =============================================
   SORTING VISUALIZER
   Generates all steps upfront, then plays them
   ============================================= */

let array = [];
let steps = [];
let stepIndex = 0;
let playing = false;
let playInterval = null;
let speed = 5;
let arraySize = 30;
let stats = { comparisons: 0, swaps: 0, accesses: 0 };
let startTime = null;

// ── Code definitions per algorithm ────────────
const CODE_LINES = {
  bubble: [
    'function bubbleSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {       // outer loop',
    '    let swapped = false;',
    '    for (let j = 0; j < n - i - 1; j++) { // inner loop',
    '      if (arr[j] > arr[j + 1]) {           // compare',
    '        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap',
    '        swapped = true;',
    '      }',
    '    }',
    '    if (!swapped) break;                  // no swaps: already sorted',
    '  }',
    '  return arr;',
    '}'
  ],
  selection: [
    'function selectionSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {    // outer loop',
    '    let minIdx = i;                      // assume min',
    '    for (let j = i + 1; j < n; j++) {  // find min',
    '      if (arr[j] < arr[minIdx]) {',
    '        minIdx = j;                      // new minimum',
    '      }',
    '    }',
    '    if (minIdx !== i) {                  // swap',
    '      let temp = arr[minIdx];',
    '      arr[minIdx] = arr[i];',
    '      arr[i] = temp;',
    '    }',
    '  }',
    '  return arr;',
    '}'
  ],
  insertion: [
    'function insertionSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 1; i < n; i++) {        // start from 1',
    '    let key = arr[i];                   // current element',
    '    let j = i - 1;',
    '    while (j >= 0 && arr[j] > key) {   // shift right',
    '      arr[j + 1] = arr[j];',
    '      j--;',
    '    }',
    '    arr[j + 1] = key;                   // insert key',
    '  }',
    '  return arr;',
    '}'
  ],
  merge: [
    'function mergeSort(arr) {',
    '  if (arr.length <= 1) return arr;      // base case',
    '  const mid = Math.floor(arr.length/2);',
    '  const left = arr.slice(0, mid);      // left half',
    '  const right = arr.slice(mid);        // right half',
    '  return merge(                         // merge sorted',
    '    mergeSort(left), mergeSort(right)',
    '  );',
    '}',
    'function merge(left, right) {',
    '  let result = [], i = 0, j = 0;',
    '  while (i < left.length && j < right.length) {',
    '    if (left[i] <= right[j]) {         // compare',
    '      result.push(left[i++]);',
    '    } else {',
    '      result.push(right[j++]);',
    '    }',
    '  }',
    '  return result.concat(left.slice(i)).concat(right.slice(j));',
    '}'
  ],
  quick: [
    'function quickSort(arr, low=0, high=arr.length-1) {',
    '  if (low < high) {',
    '    let pi = partition(arr, low, high); // pivot index',
    '    quickSort(arr, low, pi - 1);        // left of pivot',
    '    quickSort(arr, pi + 1, high);       // right of pivot',
    '  }',
    '  return arr;',
    '}',
    'function partition(arr, low, high) {',
    '  let pivot = arr[high];               // choose pivot',
    '  let i = low - 1;',
    '  for (let j = low; j < high; j++) {',
    '    if (arr[j] <= pivot) {             // compare',
    '      i++;',
    '      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap',
    '    }',
    '  }',
    '  [arr[i+1], arr[high]] = [arr[high], arr[i+1]]; // place pivot',
    '  return i + 1;',
    '}'
  ],
  heap: [
    'function heapSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = Math.floor(n/2)-1; i >= 0; i--)',
    '    heapify(arr, n, i);               // build max heap',
    '  for (let i = n - 1; i > 0; i--) {',
    '    [arr[0], arr[i]] = [arr[i], arr[0]]; // move root',
    '    heapify(arr, i, 0);              // restore heap',
    '  }',
    '  return arr;',
    '}',
    'function heapify(arr, n, i) {',
    '  let largest = i;',
    '  let l = 2*i+1, r = 2*i+2;',
    '  if (l < n && arr[l] > arr[largest])',
    '    largest = l;                      // left child larger',
    '  if (r < n && arr[r] > arr[largest])',
    '    largest = r;                      // right child larger',
    '  if (largest !== i) {',
    '    [arr[i], arr[largest]] = [arr[largest], arr[i]]; // swap',
    '    heapify(arr, n, largest);',
    '  }',
    '}'
  ]
};

// ── Step generators ────────────────────────────
function generateSteps(arr, algoId) {
  const a = [...arr];
  const steps = [];

  const addStep = (arr, highlights, comparing, swapping, pivot, sorted, codeLine, explanation) => {
    steps.push({
      arr: [...arr],
      highlights: highlights || [],
      comparing: comparing || [],
      swapping: swapping || [],
      pivot: pivot !== undefined ? pivot : -1,
      sorted: sorted || [],
      codeLine: codeLine !== undefined ? codeLine : -1,
      explanation
    });
  };

  if (algoId === 'bubble') {
    const n = a.length;
    const sortedSet = new Set();
    addStep(a, [], [], [], [], [], 0, 'Starting Bubble Sort — we will compare adjacent elements and swap if out of order.');
    for (let i = 0; i < n - 1; i++) {
      addStep(a, [], [], [], [], [...sortedSet], 2, `Outer loop: i = ${i}. Elements at indices ${n-i} to ${n-1} are already in place.`);
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        addStep(a, [], [j, j+1], [], [], [...sortedSet], 5, `Comparing arr[${j}]=${a[j]} and arr[${j+1}]=${a[j+1]}.`);
        if (a[j] > a[j+1]) {
          addStep(a, [], [], [j, j+1], [], [...sortedSet], 6, `arr[${j}]=${a[j]} > arr[${j+1}]=${a[j+1]} — swapping!`);
          [a[j], a[j+1]] = [a[j+1], a[j]];
          swapped = true;
          addStep(a, [], [], [], [], [...sortedSet], 7, `Swapped! arr[${j}]=${a[j]}, arr[${j+1}]=${a[j+1]}.`);
        }
      }
      sortedSet.add(n - 1 - i);
      if (!swapped) {
        for (let k = 0; k < n - i; k++) sortedSet.add(k);
        addStep(a, [], [], [], [], [...sortedSet], 10, `No swaps in this pass, so the rest is already sorted. Stopping early.`);
        break;
      }
    }
    for (let k = 0; k < n; k++) sortedSet.add(k);
    addStep(a, [], [], [], [], [...sortedSet], 12, '✅ Array is fully sorted!');
  }

  else if (algoId === 'selection') {
    const n = a.length;
    const sortedSet = new Set();
    addStep(a, [], [], [], [], [], 0, 'Starting Selection Sort — find the minimum element and place it at the front.');
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      addStep(a, [i], [], [], [], [...sortedSet], 3, `Position ${i}: assuming arr[${i}]=${a[i]} is the minimum.`);
      for (let j = i+1; j < n; j++) {
        addStep(a, [minIdx], [j], [], [], [...sortedSet], 5, `Checking arr[${j}]=${a[j]} against current min arr[${minIdx}]=${a[minIdx]}.`);
        if (a[j] < a[minIdx]) {
          minIdx = j;
          addStep(a, [minIdx], [], [], [], [...sortedSet], 6, `New minimum found! arr[${minIdx}]=${a[minIdx]}.`);
        }
      }
      if (minIdx !== i) {
        addStep(a, [], [], [i, minIdx], [], [...sortedSet], 10, `Swapping arr[${i}]=${a[i]} with min arr[${minIdx}]=${a[minIdx]}.`);
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        addStep(a, [], [], [], [], [...sortedSet], 11, `Placed ${a[i]} at position ${i}.`);
      }
      sortedSet.add(i);
    }
    sortedSet.add(n - 1);
    addStep(a, [], [], [], [], [...sortedSet], 15, '✅ Array is fully sorted!');
  }

  else if (algoId === 'insertion') {
    const n = a.length;
    const sortedSet = new Set([0]);
    addStep(a, [0], [], [], [], [0], 0, 'Starting Insertion Sort — first element is trivially sorted.');
    for (let i = 1; i < n; i++) {
      let key = a[i];
      addStep(a, [i], [], [], [], [...sortedSet], 3, `Picking key = arr[${i}] = ${key}. Will insert into sorted portion.`);
      let j = i - 1;
      addStep(a, [i], [], [], [], [...sortedSet], 4, `Starting from j = ${j}, comparing with key = ${key}.`);
      while (j >= 0 && a[j] > key) {
        addStep(a, [], [j, j+1], [], [], [...sortedSet], 5, `arr[${j}]=${a[j]} > key=${key} — shifting right.`);
        a[j+1] = a[j];
        j--;
        addStep(a, [], [], [j+1, j+2], [], [...sortedSet], 6, `Shifted arr[${j+2}] = ${a[j+2]}.`);
      }
      a[j+1] = key;
      sortedSet.add(i);
      addStep(a, [], [], [], [], [...sortedSet], 9, `Inserted key=${key} at position ${j+1}. Sorted portion grows to index ${i}.`);
    }
    addStep(a, [], [], [], [], [...sortedSet], 11, '✅ Array is fully sorted!');
  }

  else if (algoId === 'merge') {
    addStep(a, [], [], [], [], [], 0, 'Starting Merge Sort — divide the array in half recursively, then merge sorted halves.');
    // Nothing is in its FINAL position until the last merge, so only the
    // just-merged range is highlighted while working; green comes at the end.
    const sortedFinal = new Set();
    function mergeSteps(arr, left, right) {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      addStep(arr, [], [], [], [], [...sortedFinal], 2, `Dividing: indices ${left}…${right}, midpoint = ${mid}.`);
      mergeSteps(arr, left, mid);
      mergeSteps(arr, mid+1, right);
      // merge
      const leftArr = arr.slice(left, mid+1);
      const rightArr = arr.slice(mid+1, right+1);
      let i = 0, j = 0, k = left;
      addStep(arr, [], [], [], [], [...sortedFinal], 9, `Merging left[${left}…${mid}] and right[${mid+1}…${right}].`);
      while (i < leftArr.length && j < rightArr.length) {
        addStep(arr, [], [left+i, mid+1+j], [], [], [...sortedFinal], 12, `Comparing left[${i}]=${leftArr[i]} vs right[${j}]=${rightArr[j]}.`);
        if (leftArr[i] <= rightArr[j]) {
          arr[k++] = leftArr[i++];
          addStep(arr, [], [], [], [], [...sortedFinal], 13, `Took ${arr[k-1]} from left.`);
        } else {
          arr[k++] = rightArr[j++];
          addStep(arr, [], [], [], [], [...sortedFinal], 15, `Took ${arr[k-1]} from right.`);
        }
      }
      while (i < leftArr.length) { arr[k++] = leftArr[i++]; }
      while (j < rightArr.length) { arr[k++] = rightArr[j++]; }
      const merged = [];
      for (let x = left; x <= right; x++) merged.push(x);
      if (left === 0 && right === arr.length - 1) merged.forEach(x => sortedFinal.add(x));
      addStep(arr, merged, [], [], [], [...sortedFinal], 18, `Merged subarray [${left}…${right}]: [${arr.slice(left, right+1).join(', ')}].`);
    }
    mergeSteps(a, 0, a.length - 1);
    addStep(a, [], [], [], [], [...sortedFinal], 18, '✅ Array is fully sorted!');
  }

  else if (algoId === 'quick') {
    addStep(a, [], [], [], [], [], 0, 'Starting Quick Sort — choose pivot, partition, recurse on sub-arrays.');
    const sortedSet = new Set();
    function quickSteps(arr, low, high) {
      if (low >= high) { if (low === high) sortedSet.add(low); return; }
      addStep(arr, [], [], [], [], [...sortedSet], 1, `quickSort(arr, ${low}, ${high}) — partitioning this range.`);
      const pivotVal = arr[high];
      addStep(arr, [], [], [], high, [...sortedSet], 9, `Pivot = arr[${high}] = ${pivotVal}.`);
      let i = low - 1;
      for (let j = low; j < high; j++) {
        addStep(arr, [i+1], [j, high], [], high, [...sortedSet], 12, `Comparing arr[${j}]=${arr[j]} with pivot=${pivotVal}.`);
        if (arr[j] <= pivotVal) {
          i++;
          addStep(arr, [], [], [i, j], high, [...sortedSet], 14, `arr[${j}]=${arr[j]} ≤ pivot → swap arr[${i}] and arr[${j}].`);
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
      const pi = i + 1;
      sortedSet.add(pi);
      addStep(arr, [], [], [], pi, [...sortedSet], 17, `Pivot ${arr[pi]} placed at index ${pi}. Left: [${low}…${pi-1}], Right: [${pi+1}…${high}].`);
      quickSteps(arr, low, pi - 1);
      quickSteps(arr, pi + 1, high);
    }
    quickSteps(a, 0, a.length - 1);
    const allSorted = new Set(Array.from({length: a.length}, (_, i) => i));
    addStep(a, [], [], [], [], [...allSorted], 6, '✅ Array is fully sorted!');
  }

  else if (algoId === 'heap') {
    addStep(a, [], [], [], [], [], 0, 'Starting Heap Sort — build a max-heap, then extract max repeatedly.');
    const n = a.length;
    const sortedSet = new Set();

    function heapifySteps(arr, size, i) {
      let largest = i, l = 2*i+1, r = 2*i+2;
      addStep(arr, [i], [], [], [], [...sortedSet], 11, `heapify(arr, ${size}, ${i}) — node=${arr[i]}, left=${l<size?arr[l]:'—'}, right=${r<size?arr[r]:'—'}.`);
      if (l < size) {
        addStep(arr, [l, largest], [l, i], [], [], [...sortedSet], 13, `Comparing left child arr[${l}]=${arr[l]} with arr[${largest}]=${arr[largest]}.`);
        if (arr[l] > arr[largest]) largest = l;
      }
      if (r < size) {
        addStep(arr, [r, largest], [r, largest], [], [], [...sortedSet], 15, `Comparing right child arr[${r}]=${arr[r]} with arr[${largest}]=${arr[largest]}.`);
        if (arr[r] > arr[largest]) largest = r;
      }
      if (largest !== i) {
        addStep(arr, [], [], [i, largest], [], [...sortedSet], 18, `Swapping arr[${i}]=${arr[i]} and arr[${largest}]=${arr[largest]}.`);
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapifySteps(arr, size, largest);
      }
    }

    addStep(a, [], [], [], [], [], 2, 'Building max-heap from bottom up...');
    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapifySteps(a, n, i);
    addStep(a, [], [], [], [], [], 3, 'Max-heap built! Largest element is at root (index 0).');

    for (let i = n-1; i > 0; i--) {
      addStep(a, [], [], [0, i], [], [...sortedSet], 5, `Moving root ${a[0]} to position ${i}.`);
      [a[0], a[i]] = [a[i], a[0]];
      sortedSet.add(i);
      addStep(a, [], [], [], [], [...sortedSet], 6, `${a[i]} is in its final position.`);
      heapifySteps(a, i, 0);
    }
    sortedSet.add(0);
    addStep(a, [], [], [], [], [...sortedSet], 8, '✅ Array is fully sorted!');
  }

  return steps;
}

// ── Render functions ───────────────────────────
function renderBars(state) {
  const container = document.getElementById('barsContainer');
  if (!container) return;
  container.innerHTML = '';
  const maxVal = Math.max(...state.arr);
  const showLabels = state.arr.length <= 20;

  state.arr.forEach((val, idx) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(val / maxVal) * 95}%`;

    if (state.pivot === idx) bar.classList.add('pivot');
    else if (state.swapping.includes(idx)) bar.classList.add('swapping');
    else if (state.comparing.includes(idx)) bar.classList.add('comparing');
    else if (state.sorted.includes(idx)) bar.classList.add('sorted');
    else if (state.highlights && state.highlights.includes(idx)) bar.classList.add('highlight');

    if (showLabels) {
      const label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = val;
      bar.appendChild(label);
    }
    container.appendChild(bar);
  });
}

function renderCodeLines(algoId) {
  const lines = CODE_LINES[algoId] || [];
  const codeEl = document.getElementById('codeLines');
  if (!codeEl) return;
  codeEl.innerHTML = lines.map((line, i) =>
    `<span class="code-line" id="code-line-${i}" data-idx="${i}">${escapeHtml(line)}</span>`
  ).join('\n');
}

function highlightCodeLine(lineIdx) {
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active', 'highlight'));
  if (lineIdx >= 0) {
    const el = document.getElementById(`code-line-${lineIdx}`);
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

function applyStep(step) {
  renderBars(step);
  highlightCodeLine(step.codeLine);

  // Update stats
  if (step.comparing.length) stats.comparisons++;
  if (step.swapping.length) stats.swaps++;
  stats.accesses += step.comparing.length + step.swapping.length;

  document.getElementById('statComparisons').textContent = stats.comparisons;
  document.getElementById('statSwaps').textContent = stats.swaps;
  document.getElementById('statAccesses').textContent = stats.accesses;
  if (startTime) {
    document.getElementById('statTime').textContent = `${Date.now() - startTime}ms`;
  }

  const expEl = document.getElementById('explanationText');
  if (expEl && step.explanation) expEl.innerHTML = step.explanation;

  const statusEl = document.getElementById('statusPill');
  if (step.explanation && step.explanation.includes('✅')) {
    statusEl.textContent = '✅ Sorted!';
    statusEl.style.color = '#34d399';
  } else {
    statusEl.textContent = `Step ${stepIndex} / ${steps.length}`;
  }
}

// ── Controls ───────────────────────────────────
function startSort() {
  if (stepIndex >= steps.length) resetSort();
  startTime = startTime || Date.now();
  playing = true;
  document.getElementById('btnPlay').disabled = true;
  document.getElementById('btnPause').disabled = false;

  const getDelay = () => Math.max(20, 500 - (speed - 1) * 52);

  playInterval = setInterval(() => {
    if (stepIndex < steps.length) {
      applyStep(steps[stepIndex]);
      stepIndex++;
    } else {
      pauseSort();
      document.getElementById('statusPill').textContent = '✅ Done!';
    }
  }, getDelay());
}

function pauseSort() {
  playing = false;
  clearInterval(playInterval);
  document.getElementById('btnPlay').disabled = false;
  document.getElementById('btnPause').disabled = true;
}

function stepSort() {
  if (playing) pauseSort();
  startTime = startTime || Date.now();
  if (stepIndex < steps.length) {
    applyStep(steps[stepIndex]);
    stepIndex++;
  }
}

function resetSort() {
  pauseSort();
  stepIndex = 0;
  stats = { comparisons: 0, swaps: 0, accesses: 0 };
  startTime = null;
  document.getElementById('statComparisons').textContent = '0';
  document.getElementById('statSwaps').textContent = '0';
  document.getElementById('statAccesses').textContent = '0';
  document.getElementById('statTime').textContent = '0ms';
  document.getElementById('statusPill').textContent = 'Ready';
  document.getElementById('statusPill').style.color = '';
  document.getElementById('explanationText').innerHTML = 'Press <strong>Play</strong> or <strong>Step</strong> to start.';
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active', 'highlight'));
  renderBars(steps[0] || { arr: array, comparing: [], swapping: [], sorted: [], pivot: -1 });
}

function shuffleArray() {
  pauseSort();
  array = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 95) + 5);
  steps = generateSteps(array, ALGO_ID);
  stepIndex = 0;
  stats = { comparisons: 0, swaps: 0, accesses: 0 };
  startTime = null;
  document.getElementById('statComparisons').textContent = '0';
  document.getElementById('statSwaps').textContent = '0';
  document.getElementById('statAccesses').textContent = '0';
  document.getElementById('statTime').textContent = '0ms';
  document.getElementById('statusPill').textContent = 'Ready';
  document.getElementById('statusPill').style.color = '';
  document.getElementById('explanationText').innerHTML = 'Press <strong>Play</strong> or <strong>Step</strong> to start.';
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active', 'highlight'));
  renderBars({ arr: array, comparing: [], swapping: [], sorted: [], pivot: -1 });
}

function updateSize(val) {
  arraySize = parseInt(val);
  document.getElementById('sizeVal').textContent = val;
  shuffleArray();
}

function updateSpeed(val) {
  speed = parseInt(val);
  document.getElementById('speedVal').textContent = val;
  if (playing) { pauseSort(); startSort(); }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Init ───────────────────────────────────────
// (exported for unit tests under Node; the browser ignores this)
if (typeof module !== 'undefined') module.exports = { generateSteps, CODE_LINES };
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  array = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 95) + 5);
  steps = generateSteps(array, ALGO_ID);
  renderCodeLines(ALGO_ID);
  renderBars({ arr: array, comparing: [], swapping: [], sorted: [], pivot: -1 });
  document.getElementById('btnPause').disabled = true;
});
