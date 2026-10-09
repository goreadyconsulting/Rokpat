(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = `© ${new Date().getFullYear()}`;

  const setHeaderState = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!mobileMenu || !menuButton) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    menuButton.querySelectorAll('span').forEach(line => { line.style.transform = ''; });
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      menuButton.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
      menuButton.querySelectorAll('span').forEach((line, index) => {
        line.style.transform = open
          ? `translateY(${index === 0 ? 4.5 : -4.5}px) rotate(${index === 0 ? 45 : -45}deg)`
          : '';
      });
    });
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && mobileMenu.classList.contains('is-open')) closeMenu();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }


  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add('has-rp-cursor');

    const cursor = document.createElement('div');
    cursor.className = 'rp-cursor';
    cursor.setAttribute('aria-hidden','true');
    cursor.innerHTML = '<img src="assets/brand/rp-white.png" alt="">';
    body.appendChild(cursor);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const animateCursor = () => {
      x += (tx - x) * .34;
      y += (ty - y) * .34;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      raf = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('pointermove', event => {
      tx = event.clientX;
      ty = event.clientY;
      cursor.classList.add('is-visible');
    }, { passive:true });

    document.addEventListener('pointerover', event => {
      const target = event.target;
      const textField = target.closest?.('input, textarea, select, [contenteditable="true"]');
      const interactive = target.closest?.('a, button, [role="button"]');
      cursor.classList.toggle('is-hidden', Boolean(textField));
      cursor.classList.toggle('is-interactive', Boolean(interactive) && !textField);
    });

    document.addEventListener('pointerout', event => {
      if (!event.relatedTarget) cursor.classList.remove('is-visible');
    });

    window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
    window.addEventListener('focus', () => cursor.classList.add('is-visible'));
    window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once:true });

    animateCursor();
  }

  window.RokSite = { body, header, reduceMotion, closeMenu };
})();