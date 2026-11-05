// Copyright (c) 2026 Janat Yasser. All rights reserved.
// Sorting race: every lane gets the same array and advances one operation
// (a comparison or a swap) per tick, so finishing order = fewest operations.
(function () {
  const lanesEl = document.getElementById('lanes');
  const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
  const PER_TICK = [1, 1, 2, 3, 4, 6, 9, 14, 22, 35];
  let base = [], lanes = [], timer = null, finished = 0;

  const picks = () => [...document.querySelectorAll('#racerPicks input:checked')];

  function newNumbers() {
    base = makeInput(document.getElementById('raceInput').value, +document.getElementById('raceSize').value);
    build();
  }

  function build() {
    stop();
    finished = 0;
    lanes = picks().map((inp) => {
      // keep only steps where something happens, plus the final state
      const all = generateSteps(base, inp.value);
      const ops = all.filter((s) => s.comparing.length || s.swapping.length);
      ops.push(all[all.length - 1]);
      const el = document.createElement('article');
      el.className = 'lane';
      el.innerHTML = `
        <div class="lane-head"><span class="swatch" style="background:${inp.dataset.color}"></span><strong>${inp.dataset.name}</strong>
          <span class="lane-o">${inp.dataset.o}</span><span class="lane-place"></span></div>
        <div class="bars-container" data-nolabels="1"></div>
        <div class="race-meter"><i></i></div>
        <div class="lane-stats"><span>comparisons <b class="c">0</b></span><span>swaps <b class="s">0</b></span><span>operations <b class="o">0</b></span></div>`;
      const lane = { id: inp.value, ops, i: 0, cmp: 0, swp: 0, done: false, el, bars: el.querySelector('.bars-container') };
      renderBars({ ...ops[0], comparing: [], swapping: [], sorted: [] }, lane.bars);
      return lane;
    });
    lanesEl.replaceChildren(...lanes.map((l) => l.el));
    if (!lanes.length) lanesEl.innerHTML = '<p>Pick at least one racer above.</p>';
  }

  function tick() {
    const per = PER_TICK[+document.getElementById('raceSpeed').value - 1];
    const finishedNow = [];
    for (const L of lanes) {
      if (L.done) continue;
      for (let j = 0; j < per && L.i < L.ops.length; j++, L.i++) {
        const s = L.ops[L.i];
        if (s.comparing.length) L.cmp++;
        if (s.swapping.length) L.swp++;
      }
      const s = L.ops[Math.min(L.i, L.ops.length - 1)];
      renderBars(s, L.bars);
      L.el.querySelector('.c').textContent = L.cmp;
      L.el.querySelector('.s').textContent = L.swp;
      L.el.querySelector('.o').textContent = L.cmp + L.swp;
      L.el.querySelector('.race-meter i').style.width = `${(100 * L.i) / L.ops.length}%`;
      if (L.i >= L.ops.length) finishedNow.push(L);
    }
    if (finishedNow.length) {
      const place = finished; // a tie in the same tick shares the place
      finishedNow.forEach((L) => {
        L.done = true;
        L.el.querySelector('.lane-place').textContent = ORD[place];
        if (place === 0) L.el.classList.add('first');
        finishSweep(L.ops[L.ops.length - 1], L.bars);
      });
      if (typeof Sound !== 'undefined') Sound.finish(place + 1);
      finished += finishedNow.length;
    }
    if (lanes.every((L) => L.done)) stop();
  }

  function go() {
    if (timer || lanes.some((L) => L.done)) build();
    if (!lanes.length) return;
    document.getElementById('raceGo').textContent = 'Racing';
    document.getElementById('raceGo').disabled = true;
    timer = setInterval(tick, 40);
  }

  function stop() {
    clearInterval(timer); timer = null;
    const b = document.getElementById('raceGo');
    b.textContent = 'Start race'; b.disabled = false;
  }

  document.getElementById('raceGo').addEventListener('click', go);
  document.getElementById('raceNew').addEventListener('click', newNumbers);
  document.getElementById('raceInput').addEventListener('change', newNumbers);
  document.getElementById('raceSize').addEventListener('change', newNumbers);
  document.getElementById('racerPicks').addEventListener('change', build);
  document.getElementById('raceSpeed').addEventListener('input', (e) => { document.getElementById('raceSpeedVal').textContent = e.target.value; });
  newNumbers();
})();
