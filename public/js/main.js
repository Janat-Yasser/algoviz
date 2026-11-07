// Copyright (c) 2026 Janat Yasser. All rights reserved.
// Mark the current section in the nav
(function () {
  // Compare resolved paths so this works at / and under a sub-path (the static demo)
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-link').forEach((link) => {
    const target = new URL(link.href).pathname.replace(/\/(index\.html)?$/, '');
    if (target && path.startsWith(target)) link.classList.add('active');
  });
})();

// Keyboard: Space play/pause, Right arrow step, R reshuffle (sorting page)
document.addEventListener('keydown', (e) => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || typeof startSort !== 'function' || !document.getElementById('btnPlay')) return;
  if (e.code === 'Space') { e.preventDefault(); if (playing) pauseSort(); else startSort(); }
  if (e.code === 'ArrowRight') { e.preventDefault(); stepSort(); }
  if (e.code === 'KeyR') { e.preventDefault(); shuffleArray(); }
});
