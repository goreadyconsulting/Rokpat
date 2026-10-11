(() => {
  const hero = document.getElementById('contact-hero');
  const copyButton = document.getElementById('copy-email');
  const copyMessage = document.getElementById('copy-message');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const email = 'rokpat.dm@gmail.com';

  if (hero && !reducedMotion && window.matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', event => {
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      hero.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    }, { passive:true });
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
