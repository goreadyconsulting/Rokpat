(() => {
  const grid = document.getElementById('work-grid');
  const cards = Array.from(document.querySelectorAll('.work-card'));
  const empty = document.getElementById('work-empty');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let filter = 'all';
  let filterAnimation;

  const stopPreview = card => {
    const video = card.querySelector('video');
    card.classList.remove('is-previewing');
    video?.pause();
    if (video?.readyState) video.currentTime = 0;
  };

  const setFilter = nextFilter => {
    if (filter === nextFilter) return;
    filterAnimation?.cancel();
    filter = nextFilter;
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));

    let visible = 0;
    cards.forEach(card => {
      const categories = card.dataset.categories.split(' ');
      const show = filter === 'all' || categories.includes(filter);
      card.hidden = !show;
      if (!show) stopPreview(card);
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
    if (grid && !reducedMotion) {
      filterAnimation = grid.animate([
        { opacity:.45, transform:'translateX(-14px) skewX(-1.5deg)', clipPath:'inset(0 6% 0 0)' },
        { opacity:.85, transform:'translateX(5px) skewX(.6deg)', clipPath:'inset(0 0 0 2%)', offset:.28 },
        { opacity:1, transform:'none', clipPath:'inset(0)' }
      ], { duration:310, easing:'cubic-bezier(.18,.75,.32,1)' });
    }
  };

  const setView = view => {
    if (!grid) return;
    grid.classList.toggle('is-list', view === 'list');
    if (view === 'list') cards.forEach(stopPreview);
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  };

  filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  if (!reducedMotion && window.matchMedia('(hover:hover)').matches) {
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      video.addEventListener('playing', () => {
        if (!card.hidden && !grid?.classList.contains('is-list') && (card.matches(':hover') || card.matches(':focus-within'))) {
          card.classList.add('is-previewing');
        } else stopPreview(card);
      });
      video.addEventListener('error', () => card.classList.remove('is-previewing'));
      const playPreview = () => {
        if (card.hidden || grid?.classList.contains('is-list')) return;
        video.play().catch(() => {});
      };
      card.addEventListener('mouseenter', playPreview);
      card.addEventListener('focus', playPreview);
      card.addEventListener('blur', () => stopPreview(card));
      card.addEventListener('mouseleave', () => stopPreview(card));
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cards.forEach(stopPreview);
  });
})();
