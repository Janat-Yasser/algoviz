// Models — pure data, no DB needed for a visualizer
const algorithms = {
  sorting: [
    {
      id: 'bubble',
      name: 'Bubble Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
      stable: true,
      description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The largest elements "bubble up" to the end.',
      useCases: 'Educational purposes, nearly sorted data',
      emoji: '🫧',
      color: '#2E6BFF',
      code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {       // outer loop
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) { // inner loop
      if (arr[j] > arr[j + 1]) {           // compare
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap
        swapped = true;
      }
    }
    if (!swapped) break;                  // no swaps: already sorted
  }
  return arr;
}`
    },
    {
      id: 'selection',
      name: 'Selection Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
      stable: false,
      description: 'Finds the minimum element from the unsorted portion and places it at the beginning. Divides the array into a sorted and unsorted region.',
      useCases: 'Small datasets, when memory writes are costly',
      emoji: '🎯',
      color: '#E0418B',
      code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {    // outer loop
    let minIdx = i;                      // assume min
    for (let j = i + 1; j < n; j++) {  // find min
      if (arr[j] < arr[minIdx]) {
        minIdx = j;                      // new minimum
      }
    }
    if (minIdx !== i) {                  // swap
      let temp = arr[minIdx];
      arr[minIdx] = arr[i];
      arr[i] = temp;
    }
  }
  return arr;
}`
    },
    {
      id: 'insertion',
      name: 'Insertion Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)' },
      stable: true,
      description: 'Builds the final sorted array one item at a time by inserting each element into its correct position. Works like sorting playing cards in your hand.',
      useCases: 'Small datasets, nearly sorted arrays, online algorithms',
      emoji: '🃏',
      color: '#F08A24',
      code: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {        // start from 1
    let key = arr[i];                   // current element
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {   // shift right
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;                   // insert key
  }
  return arr;
}`
    },
    {
      id: 'merge',
      name: 'Merge Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' },
      stable: true,
      description: 'Divide and conquer algorithm that splits the array in half, recursively sorts both halves, then merges them back together.',
      useCases: 'Large datasets, linked lists, external sorting',
      emoji: '🔀',
      color: '#16A066',
      code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;      // base case
  
  const mid = Math.floor(arr.length/2);
  const left = arr.slice(0, mid);      // left half
  const right = arr.slice(mid);        // right half
  
  return merge(                         // merge sorted
    mergeSort(left),
    mergeSort(right)
  );
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  while (i < left.length &&
         j < right.length) {
    if (left[i] <= right[j]) {         // compare
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return result
    .concat(left.slice(i))
    .concat(right.slice(j));
}`
    },
    {
      id: 'quick',
      name: 'Quick Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' }, space: 'O(log n)' },
      stable: false,
      description: 'Picks a pivot element and partitions the array into elements less than and greater than the pivot, then recursively sorts each partition.',
      useCases: 'General purpose, in-place sorting, cache-friendly',
      emoji: '⚡',
      color: '#E5484D',
      code: `function quickSort(arr, low=0, high=arr.length-1) {
  if (low < high) {
    let pi = partition(arr, low, high); // pivot index
    quickSort(arr, low, pi - 1);        // left of pivot
    quickSort(arr, pi + 1, high);       // right of pivot
  }
  return arr;
}

function partition(arr, low, high) {
  let pivot = arr[high];               // choose pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {            // compare
      i++;
      [arr[i], arr[j]] =              // swap
      [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[high]] =            // place pivot
  [arr[high], arr[i+1]];
  return i + 1;
}`
    },
    {
      id: 'heap',
      name: 'Heap Sort',
      category: 'sorting',
      complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(1)' },
      stable: false,
      description: 'Builds a max-heap from the data, then repeatedly extracts the maximum element to build the sorted array.',
      useCases: 'Guaranteed O(n log n), in-place, priority queues',
      emoji: '🏔️',
      color: '#7B5CE6',
      code: `function heapSort(arr) {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n/2)-1; i >= 0; i--)
    heapify(arr, n, i);               // heapify
  
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] =               // move root to end
    [arr[i], arr[0]];
    heapify(arr, i, 0);              // restore heap
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  let l = 2*i+1, r = 2*i+2;
  if (l < n && arr[l] > arr[largest])
    largest = l;                      // left child larger
  if (r < n && arr[r] > arr[largest])
    largest = r;                      // right child larger
  if (largest !== i) {
    [arr[i], arr[largest]] =
    [arr[largest], arr[i]];          // swap
    heapify(arr, n, largest);
  }
}`
    }
  ],
  pathfinding: [
    {
      id: 'dijkstra',
      name: "Dijkstra's",
      category: 'pathfinding',
      complexity: { time: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)' }, space: 'O(V)' },
      description: "Finds the shortest path from a source to all vertices in a weighted graph. Guaranteed to find the optimal path.",
      useCases: 'GPS navigation, network routing, weighted graphs',
      emoji: '🗺️',
      color: '#2E6BFF'
    },
    {
      id: 'astar',
      name: 'A* Search',
      category: 'pathfinding',
      complexity: { time: { best: 'O(E)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)' }, space: 'O(V)' },
      description: "Uses heuristics to guide search toward the goal. More efficient than Dijkstra's for finding a single target path.",
      useCases: 'Game AI, robotics, puzzle solving',
      emoji: '⭐',
      color: '#F08A24'
    },
    {
      id: 'bfs',
      name: 'BFS',
      category: 'pathfinding',
      complexity: { time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' }, space: 'O(V)' },
      description: 'Explores all neighbors at the current depth before moving to nodes at the next depth level. Finds shortest path in unweighted graphs.',
      useCases: 'Unweighted shortest path, social networks, web crawling',
      emoji: '🌊',
      color: '#16A066'
    },
    {
      id: 'dfs',
      name: 'DFS',
      category: 'pathfinding',
      complexity: { time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' }, space: 'O(V)' },
      description: 'Explores as far as possible along each branch before backtracking. Does not guarantee shortest path.',
      useCases: 'Maze generation, topological sort, cycle detection',
      emoji: '🕳️',
      color: '#E0418B'
    }
  ],
  trees: [
    {
      id: 'bst',
      name: 'Binary Search Tree',
      category: 'trees',
      complexity: { time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' }, space: 'O(n)' },
      description: 'A binary tree where each node\'s left subtree contains only nodes with keys less than the node\'s key, and right subtree only greater keys.',
      useCases: 'Ordered data, range queries, dynamic sets',
      emoji: '🌳',
      color: '#16A066'
    }
  ]
};

module.exports = { algorithms };
