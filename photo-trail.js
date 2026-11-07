(() => {
  const hoverPointer = matchMedia('(hover:hover) and (pointer:fine) and (min-width:768px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const duration = 1450;
  const interval = 105;
  const poolSize = Math.ceil(duration / interval);

  document.querySelectorAll('[data-photo-trail]').forEach(gallery => {
    const area = gallery.closest('[data-photo-trail-area]');
    const originals = [...gallery.children];
    if (!area || !originals.length) return;
    const photos = [...originals];
    const animations = new Map();
    let last;
    let index = 0;

    const setMode = () => {
      last = null;
      index = 0;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      gallery.classList.toggle('is-interactive', hoverPointer.matches);
      if (hoverPointer.matches) {
        while (photos.length < poolSize) photos.push(originals[photos.length % originals.length].cloneNode(true));
      } else {
        photos.splice(originals.length).forEach(photo => photo.remove());
        originals.forEach(photo => {
          photo.style.removeProperty('left');
          photo.style.removeProperty('top');
        });
      }
      gallery.append(...photos);
    };

    const reveal = event => {
      if (!hoverPointer.matches || event.pointerType === 'touch' || event.target.closest('a,button')) return;
      const { clientX:x, clientY:y, timeStamp:time } = event;
      if (last && (time - last.time < interval || Math.hypot(x - last.x, y - last.y) < 76)) return;

      const bounds = gallery.getBoundingClientRect();
      const photo = photos[index];
      const half = photo.offsetWidth / 2;
      photo.style.left = `${Math.max(half, Math.min(bounds.width - half, x - bounds.left))}px`;
      photo.style.top = `${Math.max(half, Math.min(bounds.height - half, y - bounds.top))}px`;
      gallery.append(photo);
      animations.get(photo)?.cancel();
      const frames = reducedMotion.matches
        ? [{ opacity:.68 }, { opacity:.68 }]
        : [{ opacity:0 }, { opacity:.68, offset:.1 }, { opacity:.68, offset:.76 }, { opacity:0 }];
      const animation = photo.animate(frames, { duration:reducedMotion.matches ? 1000 : duration });
      animations.set(photo, animation);
      animation.addEventListener('finish', () => {
        if (animations.get(photo) === animation) animations.delete(photo);
      });
      index = (index + 1) % photos.length;
      last = { x, y, time };
    };

    setMode();
    area.addEventListener('pointerenter', reveal, { passive:true });
    area.addEventListener('pointermove', reveal, { passive:true });
    area.addEventListener('pointerleave', () => { last = null; });
    hoverPointer.addEventListener('change', setMode);
    reducedMotion.addEventListener('change', setMode);
  });
})();
