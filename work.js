(() => {
  const grid = document.getElementById('work-grid');
  const cards = Array.from(document.querySelectorAll('.work-card'));
  const empty = document.getElementById('work-empty');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width:768px)');
  let filter = 'all';
  let transition;

  const stopPreview = card => {
    const video = card.querySelector('video');
    card.classList.remove('is-previewing');
    video?.pause();
    if (video?.readyState) video.currentTime = 0;
  };

  const clearTransition = () => {
    if (!transition) return;
    transition.animations.forEach(animation => animation.cancel());
    transition.overlay?.remove();
    transition = null;
  };

  const usesSlices = () => desktop.matches && !grid.classList.contains('is-list');

  const captureThumbnails = () => {
    if (!grid || reducedMotion.matches || !usesSlices()) return [];
    const bounds = grid.getBoundingClientRect();
    return cards.flatMap(card => {
      if (card.hidden) return [];
      const image = card.querySelector('figure img');
      if (!image?.complete || !image.naturalWidth) return [];
      const { left, top, bottom, width, height } = image.parentElement.getBoundingClientRect();
      if (bottom <= 0 || top >= innerHeight || !width) return [];
      return [{ src:image.currentSrc, left:left - bounds.left, top:top - bounds.top, width, height }];
    });
  };

  const playTransition = thumbnails => {
    if (!grid || reducedMotion.matches) return;
    const animations = [];
    let overlay;
    if (!usesSlices()) {
      animations.push(grid.animate([
        { opacity:.45, transform:'translateX(-14px) skewX(-1.5deg)', clipPath:'inset(0 6% 0 0)' },
        { opacity:.85, transform:'translateX(5px) skewX(.6deg)', clipPath:'inset(0 0 0 2%)', offset:.28 },
        { opacity:1, transform:'none', clipPath:'inset(0)' }
      ], { duration:310, easing:'cubic-bezier(.18,.75,.32,1)' }));
    } else {
      if (thumbnails.length) {
        overlay = document.createElement('div');
        overlay.className = 'work-glitch';
        overlay.setAttribute('aria-hidden','true');
        const distance = Math.min(grid.clientWidth * .055,80);
        [-.75,1,-.58].forEach((direction,index,directions) => {
          const band = document.createElement('div');
          band.className = 'work-glitch-band';
          thumbnails.forEach(({ src,left,top,width,height }) => {
            const bandHeight = height / directions.length;
            const offset = index * bandHeight;
            const fragment = document.createElement('div');
            fragment.className = 'work-glitch-fragment';
            Object.assign(fragment.style, {
              left:`${left}px`, top:`${top + offset}px`, width:`${width}px`, height:`${bandHeight}px`
            });
            const image = new Image();
            image.src = src;
            image.alt = '';
            image.style.height = `${height}px`;
            image.style.top = `${-offset}px`;
            fragment.append(image);
            band.append(fragment);
          });
          overlay.append(band);
          const shift = distance * direction;
          animations.push(band.animate([
            { transform:'translateX(0)', opacity:1, easing:'steps(1,end)' },
            { transform:`translateX(${shift}px)`, opacity:1, offset:.2, easing:'steps(1,end)' },
            { transform:`translateX(${shift * -.32}px)`, opacity:.95, offset:.43, easing:'steps(1,end)' },
            { transform:`translateX(${shift * 1.12}px)`, opacity:.72, offset:.6, easing:'ease-out' },
            { transform:`translateX(${shift * 1.3}px)`, opacity:0 }
          ], { duration:255, fill:'forwards' }));
        });
        grid.append(overlay);
      }

      cards.filter(card => !card.hidden).forEach(card => {
        animations.push(card.animate([
          { opacity:0, transform:'translateX(25px)', clipPath:'inset(39% 0 45%)', easing:'steps(1,end)' },
          { opacity:1, transform:'translateX(-13px)', clipPath:'inset(8% 0 12%)', offset:.25, easing:'steps(1,end)' },
          { opacity:1, transform:'translateX(4px)', clipPath:'inset(0)', offset:.55, easing:'ease-out' },
          { opacity:1, transform:'none', clipPath:'inset(0)' }
        ], { delay:overlay ? 170 : 0, duration:230, fill:'backwards' }));
      });
    }
    const current = transition = { overlay, animations };
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (transition === current) clearTransition();
    }, () => {});
  };

  const setFilter = nextFilter => {
    if (filter === nextFilter) return;
    clearTransition();
    const thumbnails = captureThumbnails();
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
    playTransition(thumbnails);
  };

  const setView = view => {
    if (!grid) return;
    clearTransition();
    grid.classList.toggle('is-list', view === 'list');
    if (view === 'list') cards.forEach(stopPreview);
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  };

  filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  reducedMotion.addEventListener('change', clearTransition);
  window.addEventListener('resize', clearTransition, { passive:true });

  if (!reducedMotion.matches && window.matchMedia('(hover:hover)').matches) {
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
