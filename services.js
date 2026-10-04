(() => {
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  if (!panels.length) return;

  const finePointer = window.matchMedia('(pointer:fine)').matches;
  let active = panels.find(panel => panel.classList.contains('is-active')) || panels[0];
  let hoverTimer = 0;

  const activate = panel => {
    if (!panel) return;
    active = panel;
    panels.forEach(item => {
      const on = item === panel;
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-expanded', String(on));
    });
  };

  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activate(panel), 90);
    });

    panel.addEventListener('click', () => activate(panel));

    panel.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(panel);
      }
    });

    const poster = panel.querySelector('.service-poster');
    poster?.addEventListener('error', () => {
      const src = poster.currentSrc || poster.src;
      const match = src.match(/\/vi\/([^/]+)\//);
      const id = match?.[1];
      if (id && !poster.dataset.fallback) {
        poster.dataset.fallback = 'true';
        poster.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    });
  });

  activate(active);
})();