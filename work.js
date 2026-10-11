(() => {
  const grid = document.getElementById('work-grid');
  const cards = Array.from(document.querySelectorAll('.work-card'));
  const empty = document.getElementById('work-empty');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let filter = 'all';

  const setFilter = nextFilter => {
    filter = nextFilter;
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));

    let visible = 0;
    cards.forEach(card => {
      const categories = card.dataset.categories.split(' ');
      const show = filter === 'all' || categories.includes(filter);
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  };

  const setView = view => {
    if (!grid) return;
    grid.classList.toggle('is-list', view === 'list');
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  };

  filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  if (!reducedMotion && window.matchMedia('(hover:hover)').matches) {
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }
})();
