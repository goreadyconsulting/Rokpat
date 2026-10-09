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


  // The Play Reel artwork is a homepage-only pointer, never a site-wide cursor.
  const hero = document.querySelector('.home-page .hero-scene');
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (hero && finePointer && !reduceMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'rp-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = 'assets/home/play-reel.png';
    img.alt = '';
    cursor.appendChild(img);
    body.appendChild(cursor);

    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
    let raf = 0;
    const animate = () => {
      x += (tx - x) * .4;
      y += (ty - y) * .4;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      raf = requestAnimationFrame(animate);
    };

    hero.addEventListener('pointermove', event => {
      tx = event.clientX;
      ty = event.clientY;
      cursor.classList.add('is-visible');
      cursor.classList.toggle('is-interactive', !!event.target.closest('button, a'));
    }, { passive:true });
    hero.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
    window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once:true });
    animate();
  }

  window.RokSite = { body, header, reduceMotion, closeMenu };
})();