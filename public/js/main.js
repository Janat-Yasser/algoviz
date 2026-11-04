// Mark the current section in the nav
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href !== '/' && path.startsWith(href)) link.classList.add('active');
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
