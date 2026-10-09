(() => {
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  const section = document.getElementById('services');
  if (!section || !panels.length) return;

  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = panels.find(el => el.classList.contains('is-active')) || panels[0];
  let sectionVisible = false;
  let hoverTimer = 0;

  // One native MP4 player for all the panels; inactive panels use posters.
  const player = document.createElement('video');
  player.className = 'service-loop';
  player.muted = true;
  player.autoplay = true;
  player.loop = true;
  player.playsInline = true;
  player.preload = 'none';
  player.setAttribute('aria-hidden', 'true');
  player.addEventListener('playing', () => {
    if (player.parentElement === active) active.classList.add('is-playing');
  });
  player.addEventListener('error', () => active.classList.remove('is-playing'));

  const unload = () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    player.remove();
    panels.forEach(el => el.classList.remove('is-playing'));
  };

  const playActive = () => {
    if (!sectionVisible || document.hidden || reducedMotion || !active) return;
    const source = active.dataset.serviceSrc;
    if (!source) return;
    panels.forEach(el => el.classList.remove('is-playing'));
    if (player.parentElement !== active) active.insertBefore(player, active.querySelector('.service-shade'));
    if (player.getAttribute('src') !== source) {
      player.src = source;
      player.load();
    }
    player.play().catch(() => active.classList.remove('is-playing'));
  };

  const activate = panel => {
    if (!panel) return;
    if (panel !== active) {
      player.pause();
      panels.forEach(el => el.classList.remove('is-playing'));
      active = panel;
    }
    panels.forEach(el => {
      const on = el === active;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-expanded', String(on));
    });
    playActive();
  };

  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      if (!finePointer) return;
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activate(panel), 110);
    });
    panel.addEventListener('click', () => activate(panel));
    panel.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(panel);
      }
    });
  });

  const observer = new IntersectionObserver(entries => {
    sectionVisible = entries.some(entry => entry.isIntersecting);
    if (sectionVisible) playActive();
    else unload();
  }, {threshold:0.1});
  observer.observe(document.getElementById('service-panels') || section);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) unload();
    else playActive();
  });
  activate(active);
})();