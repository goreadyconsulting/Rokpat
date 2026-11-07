(() => {
  const hero = document.getElementById('contact-hero');
  const copyButton = document.getElementById('copy-email');
  const copyMessage = document.getElementById('copy-message');
  const gallery = document.getElementById('contact-gallery');
  const photos = [...document.querySelectorAll('.contact-photo')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:768px)');
  const email = 'rokpat.dm@gmail.com';

  if (hero && gallery && photos.length) {
    let positions = [];
    const hidePhotos = () => photos.forEach(photo => photo.classList.remove('is-visible'));
    const measure = () => {
      const galleryBounds = gallery.getBoundingClientRect();
      const heroBounds = hero.getBoundingClientRect();
      positions = photos.map(photo => ({
        photo,
        x:galleryBounds.left - heroBounds.left + photo.offsetLeft + photo.offsetWidth / 2,
        y:galleryBounds.top - heroBounds.top + photo.offsetTop + photo.offsetHeight / 2
      }));
    };
    const setMode = () => {
      hidePhotos();
      gallery.classList.toggle('is-interactive', hoverPointer.matches);
      measure();
    };
    const reveal = event => {
      if (!hoverPointer.matches || event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const nearest = positions.map(position => ({
        ...position,
        distance:Math.hypot(x - position.x, y - position.y)
      })).sort((a,b) => a.distance - b.distance).slice(0,3);
      const visible = new Set(nearest.map(position => position.photo));

      // Visibility changes in the pointer event, with no timer or opacity transition.
      positions.forEach(({photo}) => photo.classList.toggle('is-visible', visible.has(photo)));
      nearest.forEach(({photo,x:cx,y:cy}) => {
        photo.style.setProperty('--dx', `${reducedMotion.matches ? 0 : Math.max(-18,Math.min(18,(x - cx) * .06))}px`);
        photo.style.setProperty('--dy', `${reducedMotion.matches ? 0 : Math.max(-18,Math.min(18,(y - cy) * .06))}px`);
      });
    };
    setMode();
    hero.addEventListener('pointerenter', reveal, { passive:true });
    hero.addEventListener('pointermove', reveal, { passive:true });
    hero.addEventListener('pointerleave', hidePhotos);
    window.addEventListener('blur', hidePhotos);
    hoverPointer.addEventListener('change', setMode);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(hero);
    else window.addEventListener('resize', measure);
  }

  if (copyButton && copyMessage) {
    copyButton.addEventListener('click', () => {
      if (!navigator.clipboard) {
        copyMessage.textContent = 'Select the address above to copy it.';
        return;
      }

      navigator.clipboard.writeText(email).then(() => {
        copyMessage.textContent = 'Copied.';
      }, () => {
        copyMessage.textContent = 'Select the address above to copy it.';
      });
    });
  }
})();
