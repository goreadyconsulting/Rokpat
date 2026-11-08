(() => {
  const studio = document.querySelector('.suggested-grid');
  if (studio) {
    const workUrl = new URL('../work.html', location.href);
    const pairKey = 'rokpat:studio-pair';
    let previousPair = [];

    const refreshStudio = async () => {
      try {
        const response = await fetch(workUrl);
        if (!response.ok) return;
        const catalog = document.createElement('template');
        catalog.innerHTML = await response.text();
        const candidates = [...catalog.content.querySelectorAll('#work-grid .work-card')].flatMap(card => {
          const href = card.getAttribute('href');
          const poster = card.querySelector('img')?.getAttribute('src');
          const title = card.querySelector('h2')?.textContent.trim();
          const details = card.querySelector('p')?.cloneNode(true);
          details?.querySelector('.work-credit')?.remove();
          if (!href || !poster || !title || !details) return [];
          const url = new URL(href, workUrl);
          if (url.pathname === location.pathname) return [];
          return [{ url, poster:new URL(poster, workUrl), title, details }];
        });
        if (candidates.length < 2) return;

        try {
          const saved = JSON.parse(sessionStorage.getItem(pairKey));
          if (Array.isArray(saved)) previousPair = saved;
        } catch { /* The current page still remembers its last pair when storage is unavailable. */ }

        const fresh = candidates.filter(project => !previousPair.includes(project.url.pathname));
        const pool = fresh.length >= 2 ? fresh : candidates;
        const picks = [0, 1].map(() => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        const cards = picks.map(project => {
          const link = document.createElement('a');
          link.href = project.url;
          const image = document.createElement('img');
          image.src = project.poster;
          image.alt = '';
          image.loading = 'lazy';
          image.decoding = 'async';
          const title = document.createElement('h3');
          title.textContent = project.title;
          link.append(image, title, project.details);
          return link;
        });
        studio.replaceChildren(...cards);
        previousPair = picks.map(project => project.url.pathname);
        try { sessionStorage.setItem(pairKey, JSON.stringify(previousPair)); } catch { /* Storage is optional. */ }
      } catch { /* Leave the links in the page available if the Work grid can't be loaded. */ }
    };

    refreshStudio();
    window.addEventListener('pageshow', event => { if (event.persisted) refreshStudio(); });
  }

  const modifiedClick = event => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  const media = document.getElementById('project-media');
  const play = media?.querySelector('[data-video-id]');

  play?.addEventListener('click', event => {
    const { videoId:id, videoProvider } = play.dataset;
    if (modifiedClick(event)) return;
    const source = videoProvider === 'vimeo'
      ? /^\d+$/.test(id) && `https://player.vimeo.com/video/${id}?autoplay=1`
      : /^[A-Za-z0-9_-]{11}$/.test(id) && `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    if (!source) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.title = play.dataset.videoTitle;
    frame.src = source;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    media.replaceChildren(frame);
    frame.focus();
  });

  const gallery = document.getElementById('project-gallery');
  const controls = document.querySelector('.project-assets-controls');
  if (!gallery || !controls) return;
  const [previous, next] = controls.querySelectorAll('[data-gallery-step]');
  const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const syncControls = () => {
    const end = gallery.scrollWidth - gallery.clientWidth;
    controls.hidden = end <= 1;
    gallery.tabIndex = controls.hidden ? -1 : 0;
    previous.disabled = gallery.scrollLeft <= 1;
    next.disabled = gallery.scrollLeft >= end - 1;
  };
  [previous, next].forEach(button => button.addEventListener('click', () => {
    gallery.scrollBy({ left:Number(button.dataset.galleryStep) * gallery.clientWidth * .8,
      behavior:reduceMotion.matches ? 'instant' : 'smooth' });
  }));
  gallery.addEventListener('scroll', syncControls, { passive:true });
  new ResizeObserver(syncControls).observe(gallery);
  syncControls();

  const preview = document.createElement('dialog');
  if (typeof preview.showModal !== 'function') return;
  preview.className = 'project-image-dialog';
  preview.setAttribute('aria-label','Full-size project image');
  preview.innerHTML = '<button class="project-image-close" type="button" aria-label="Close image" autofocus>×</button><figure><img alt=""><figcaption></figcaption></figure>';
  const image = preview.querySelector('img');
  const caption = preview.querySelector('figcaption');
  let opener;
  preview.querySelector('button').addEventListener('click', () => preview.close());
  preview.addEventListener('click', event => { if (event.target === preview) preview.close(); });
  preview.addEventListener('close', () => opener?.focus({ preventScroll:true }));
  gallery.addEventListener('click', event => {
    const link = event.target.closest('.project-still');
    if (!link || modifiedClick(event)) return;
    event.preventDefault();
    opener = link;
    const description = link.querySelector('img').alt;
    image.src = link.href;
    image.alt = description;
    caption.textContent = link.closest('figure').querySelector('figcaption')?.textContent || description;
    preview.showModal();
  });
  document.body.append(preview);
})();
