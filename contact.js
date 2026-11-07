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
    let last;
    let index = 0;
    const animations = new Map();
    const setMode = () => {
      last = null;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      gallery.append(...photos);
      index = 0;
      gallery.classList.toggle('is-interactive', hoverPointer.matches);
    };
    const reveal = event => {
      if (!hoverPointer.matches || event.pointerType === 'touch' || event.target.closest('a,button')) return;
      const now = event.timeStamp;
      const { clientX:x, clientY:y } = event;
      if (last && (now - last.time < 105 || Math.hypot(x - last.x, y - last.y) < 76)) return;

      const bounds = gallery.getBoundingClientRect();
      const photo = photos[index];
      const half = photo.offsetWidth / 2;
      photo.style.left = `${Math.max(half, Math.min(bounds.width - half, x - bounds.left))}px`;
      photo.style.top = `${Math.max(half, Math.min(bounds.height - half, y - bounds.top))}px`;
      gallery.append(photo);
      animations.get(photo)?.cancel();
      const frames = reducedMotion.matches
        ? [{ opacity:.94 }, { opacity:.94 }]
        : [{ opacity:0 }, { opacity:.94, offset:.1 }, { opacity:.94, offset:.76 }, { opacity:0 }];
      const animation = photo.animate(frames, { duration:reducedMotion.matches ? 1000 : 1450 });
      animations.set(photo, animation);
      animation.addEventListener('finish', () => {
        if (animations.get(photo) === animation) animations.delete(photo);
      });
      index = (index + 1) % photos.length;
      last = { x, y, time:now };
    };
    setMode();
    hero.addEventListener('pointerenter', reveal, { passive:true });
    hero.addEventListener('pointermove', reveal, { passive:true });
    hero.addEventListener('pointerleave', () => { last = null; });
    hoverPointer.addEventListener('change', setMode);
    reducedMotion.addEventListener('change', setMode);
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
