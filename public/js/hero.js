// Copyright (c) 2026 Janat Yasser. All rights reserved.
// Home page: a real sort running on loop. Uses generateSteps() from sorting.js.
(function () {
  const box = document.getElementById('heroBars');
  if (!box || typeof generateSteps !== 'function') return;
  const ORDER = [['quick', 'Quick sort'], ['merge', 'Merge sort'], ['heap', 'Heap sort'], ['insertion', 'Insertion sort'], ['bubble', 'Bubble sort'], ['selection', 'Selection sort']];
  const N = 56;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let k = 0, steps = [], i = 0, cmp = 0, swp = 0, timer = null;

  function load() {
    const [id, name] = ORDER[k % ORDER.length];
    document.getElementById('heroName').textContent = name;
    steps = generateSteps(makeInput('random', N), id);
    i = 0; cmp = 0; swp = 0;
    renderBars(steps[0], box);
  }

  function tick() {
    // slow O(n²) sorts skip ahead so every algorithm takes a similar few seconds on screen
    const per = Math.max(1, Math.round(steps.length / 260));
    for (let j = 0; j < per && i < steps.length; j++, i++) {
      const s = steps[i];
      if (s.comparing.length) cmp++;
      if (s.swapping.length) swp++;
      if (j === per - 1 || i === steps.length - 1) {
        renderBars(s, box);
        if (Sound.on) {
          const max = 99;
          s.comparing.slice(0, 1).forEach((x) => Sound.compare(s.arr[x], max));
          s.swapping.slice(0, 1).forEach((x) => Sound.swap(s.arr[x], max));
        }
      }
    }
    document.getElementById('heroCmp').textContent = cmp;
    document.getElementById('heroSwp').textContent = swp;
    if (i >= steps.length) {
      clearInterval(timer); timer = null;
      finishSweep(steps[steps.length - 1], box);
      setTimeout(() => { k++; load(); start(); }, 2200);
    }
  }

  function start() { if (!timer) timer = setInterval(tick, 28); }

  document.getElementById('heroNext').addEventListener('click', () => {
    clearInterval(timer); timer = null; k++; load(); start();
  });

  load();
  if (reduced) {
    renderBars(steps[steps.length - 1], box); // show the finished state, no motion
    document.getElementById('heroNext').textContent = 'Play a sort';
  } else {
    start();
  }
})();
