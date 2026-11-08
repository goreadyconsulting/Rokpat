(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-copyright-year]').forEach(year => {
    year.textContent = new Date().getFullYear();
  });
  const setHeaderState = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!mobileMenu || !menuButton) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.inert = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
    menuButton.querySelectorAll('span').forEach(line => { line.style.transform = ''; });
  };

  if (menuButton && mobileMenu) {
    mobileMenu.inert = true;
    menuButton.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      mobileMenu.inert = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      body.classList.toggle('menu-open', open);
      menuButton.querySelectorAll('span').forEach((line, index) => {
        line.style.transform = open
          ? `translateY(${index === 0 ? 4.5 : -4.5}px) rotate(${index === 0 ? 45 : -45}deg)`
          : '';
      });
    });
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (!mobileMenu.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        closeMenu();
        menuButton.focus();
      } else if (event.key === 'Tab') {
        const focusable = [menuButton, ...mobileLinks];
        const index = focusable.indexOf(document.activeElement);
        event.preventDefault();
        focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
      }
    });
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

  const yellowText = [
    '.hero-name-left', '.featured-heading > span:first-child', '.brand-section-title h2',
    '.about-home-copy h2 > span', '.clients-title h2 > span', '.testimonial-card h3 em',
    '.create-letters', '.footer-brand strong > span', '.work-intro h1', '.work-empty button',
    '.about-copy h1 em', '.about-cta em', '.process-steps article > span', '.about-footer strong > span',
    '.contact-hero h1 em', '.contact-footer strong > span', '.work-footer strong > span',
    '.project-intro h1', '.about-nav a[aria-current]', '.work-nav a[aria-current]', '.contact-nav a[aria-current]'
  ].join(',');
  const desktopMotion = matchMedia('(min-width:768px) and (prefers-reduced-motion:no-preference)');
  const dancers = new WeakMap();

  const dance = element => {
    if (!desktopMotion.matches) return;
    if (!dancers.has(element)) {
      const letters = [];
      if (element.childElementCount === 0 && !element.matches('.work-card h2')) {
        const label = document.createElement('span');
        label.className = 'dance-readable';
        label.textContent = element.textContent;
        element.replaceChildren(label);
        for (const part of label.textContent.split(/(\s+)/)) {
          if (!part.trim()) {
            element.append(part);
            continue;
          }
          const word = document.createElement('span');
          word.className = 'dance-word';
          word.setAttribute('aria-hidden', 'true');
          for (const glyph of part) {
            const letter = document.createElement('span');
            letter.className = 'dance-letter';
            letter.textContent = glyph;
            word.append(letter);
            letters.push(letter);
          }
          element.append(word);
        }
      }
      dancers.set(element, letters.length ? letters : [element]);
    }
    dancers.get(element).forEach((letter, index) => {
      letter.getAnimations().filter(animation => animation.id === 'yellow-dance').forEach(animation => animation.cancel());
      const animation = letter.animate([
        { translate:'0 0', rotate:'0deg' },
        { translate:'0 -.12em', rotate:index % 2 ? '4deg' : '-4deg', offset:.38 },
        { translate:'0 .02em', rotate:'0deg', offset:.72 },
        { translate:'0 0', rotate:'0deg' }
      ], { duration:420, delay:Math.min(index * 29, 350), easing:'ease-in-out' });
      animation.id = 'yellow-dance';
    });
  };

  if ('IntersectionObserver' in window) {
    const yellowObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting && desktopMotion.matches) {
          dance(target);
          yellowObserver.unobserve(target);
        }
      });
    }, { threshold:.3 });
    document.querySelectorAll(yellowText).forEach(element => yellowObserver.observe(element));
  }

  const hoverYellow = [
    '.hero-intro a', '.featured-more', '.bts-footer a', '.home-footer nav a',
    '.about-nav-group a', '.contact-nav-group a', '.work-nav-group a',
    '.about-footer a', '.contact-footer a', '.work-footer a', '.contact-email',
    '.copy-email', '.contact-row', '.logo-arrow:not(:disabled)', '.testimonial-arrow',
    '.project-back', '.project-source', '.project-play', '.project-pagination a',
    '.suggested-grid a', '.work-card'
  ].join(',');
  const danceOnInteraction = event => {
    const target = event.target.closest(yellowText + ',' + hoverYellow);
    if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
    const label = target.querySelector('h2,h3') || target;
    const permanent = target.matches(yellowText);
    if (event.type === 'pointerover' || permanent || target.matches('.logo-arrow,.project-play')) {
      dance(label);
    }
  };
  document.addEventListener('pointerover', danceOnInteraction);
  document.addEventListener('focusin', danceOnInteraction);

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
