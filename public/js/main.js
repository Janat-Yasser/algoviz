/* =============================================
   ALGOVIZ — Main JS
   ============================================= */

// Highlight active nav link
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.startsWith(href) && href !== '/') {
      link.style.color = 'white';
      link.style.background = 'rgba(99,102,241,0.15)';
    }
  });
})();

// Keyboard shortcuts global
document.addEventListener('keydown', e => {
  // Space = play/pause on sorting page
  if (e.code === 'Space' && typeof startSort === 'function' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    if (typeof playing !== 'undefined' && playing) pauseSort();
    else startSort();
  }
  // Right arrow = step
  if (e.code === 'ArrowRight' && typeof stepSort === 'function' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    stepSort();
  }
  // R = reset/shuffle
  if (e.code === 'KeyR' && typeof shuffleArray === 'function' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    shuffleArray();
  }
});
