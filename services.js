(() => {
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  const section = document.getElementById('services');
  if (!panels.length || !section) return;

  const reduceMotion = window.RokSite?.reduceMotion || false;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  let active = panels.find(panel => panel.classList.contains('is-active')) || panels[0];
  let sectionVisible = false;
  let hoverTimer = 0;

  const player = document.createElement('iframe');
  player.title = 'Service example video';
  player.allow = 'autoplay; encrypted-media; picture-in-picture';
  player.setAttribute('tabindex','-1');
  player.setAttribute('aria-hidden','true');

  const stopPlayer = () => {
    player.src = '';
    panels.forEach(panel => panel.classList.remove('is-playing'));
    player.remove();
  };

  const loadPlayer = panel => {
    if (!panel || reduceMotion || !sectionVisible) return;
    const id = panel.dataset.videoId;
    const slot = panel.querySelector('.service-video-slot');
    if (!id || !slot) return;

    panels.forEach(item => item.classList.remove('is-playing'));
    if (player.parentElement !== slot) slot.appendChild(player);

    const nextSrc = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0&modestbranding=1&playsinline=1&disablekb=1`;
    if (player.src !== nextSrc) player.src = nextSrc;
    panel.classList.add('is-playing');
  };

  const activate = (panel, play = true) => {
    if (!panel || panel === active) {
      if (play) loadPlayer(panel);
      return;
    }

    active = panel;
    panels.forEach(item => {
      const on = item === panel;
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-expanded', String(on));
    });

    if (play) loadPlayer(panel);
  };

  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activate(panel, true), 110);
    });

    panel.addEventListener('click', event => {
      if (event.target.closest('.service-watch')) return;
      activate(panel, true);
    });

    panel.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(panel, true);
      }
    });

    const poster = panel.querySelector('.service-poster');
    poster?.addEventListener('error', () => {
      const id = panel.dataset.videoId;
      if (id && !poster.dataset.fallback) {
        poster.dataset.fallback = 'true';
        poster.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      sectionVisible = entry.isIntersecting && entry.intersectionRatio > .18;
      if (sectionVisible) loadPlayer(active);
      else stopPlayer();
    });
  }, { threshold:[0,.18,.45] });

  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPlayer();
    else if (sectionVisible) loadPlayer(active);
  });
})();