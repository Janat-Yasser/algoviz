/* Sonification: each compared or swapped bar plays a pitch that rises with its value,
   the way "sorting algorithms visualised and audibilised" videos do. Off by default. */
const Sound = (() => {
  let ctx = null;
  let on = false;
  try { on = localStorage.getItem('algoviz-sound') === '1'; } catch (e) { /* storage blocked */ }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur = 0.09, type = 'triangle', vol = 0.07, when = 0) {
    if (!on || !ensure()) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const pitch = (v, max) => 160 + (v / (max || 100)) * 960;

  return {
    get on() { return on; },
    set(v) {
      on = !!v;
      if (on) ensure();
      try { localStorage.setItem('algoviz-sound', on ? '1' : '0'); } catch (e) { /* ignore */ }
    },
    toggle() { this.set(!on); return on; },
    compare(v, max) { tone(pitch(v, max), 0.08, 'triangle', 0.06); },
    swap(v, max) { tone(pitch(v, max), 0.07, 'square', 0.025); },
    finish(place = 1) {
      const root = place === 1 ? 523 : 392;
      [1, 1.25, 1.5, 2].forEach((m, i) => tone(root * m, 0.25, 'triangle', 0.06, i * 0.07));
    },
    sweepNote(v, max) { tone(pitch(v, max), 0.05, 'sine', 0.05); },
  };
})();

// Wire up any sound toggle on the page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-sound-toggle]').forEach((b) => {
    const sync = () => { b.setAttribute('aria-pressed', String(Sound.on)); b.textContent = Sound.on ? 'Sound on' : 'Sound off'; };
    sync();
    b.addEventListener('click', () => { Sound.toggle(); sync(); });
  });
});
