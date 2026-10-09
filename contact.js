(() => {
  const stage = document.getElementById('contact-stage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The artwork is fixed in a grid. Only the radial reveal tracks pointer movement.
  if (stage && !reducedMotion) {
    let x = -500;
    let y = -500;
    let targetX = -500;
    let targetY = -500;
    let raf = 0;
    let hideTimer = 0;
    let initialized = false;

    const renderSpotlight = () => {
      raf = 0;
      x += (targetX - x) * .30;
      y += (targetY - y) * .30;
      stage.style.setProperty('--spot-x', `${x}px`);
      stage.style.setProperty('--spot-y', `${y}px`);

      if (Math.abs(targetX - x) > .5 || Math.abs(targetY - y) > .5) {
        raf = requestAnimationFrame(renderSpotlight);
      }
    };

    const moveSpotlight = event => {
      if (event.pointerType === 'touch' && event.type === 'pointermove' && event.buttons === 0) return;
      const bounds = stage.getBoundingClientRect();
      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;

      if (!initialized) {
        x = targetX;
        y = targetY;
        initialized = true;
      }

      stage.classList.add('is-revealing');
      if (!raf) raf = requestAnimationFrame(renderSpotlight);

      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        stage.classList.remove('is-revealing');
      }, 950);
    };

    stage.addEventListener('pointermove', moveSpotlight, { passive:true });
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse') moveSpotlight(event);
    }, { passive:true });
    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('is-revealing');
      window.clearTimeout(hideTimer);
    });

    window.addEventListener('blur', () => stage.classList.remove('is-revealing'));
    window.addEventListener('pagehide', () => {
      window.clearTimeout(hideTimer);
      cancelAnimationFrame(raf);
    }, { once:true });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();

      const values = new FormData(contactForm);
      const name = String(values.get('name') || '').trim();
      const email = String(values.get('email') || '').trim();
      const projectType = String(values.get('projectType') || '').trim();
      const message = String(values.get('message') || '').trim();

      const subject = `Project enquiry${projectType ? ` - ${projectType}` : ''}${name ? ` - ${name}` : ''}`;
      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        projectType ? `Project type: ${projectType}` : '',
        '',
        message
      ].filter((line,index) => line || index === 3);

      window.location.href =
        `mailto:rokpat.dm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    });
  }
})();