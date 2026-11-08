(() => {
  const { body = document.body, header = document.querySelector('.site-header'), reduceMotion = false } = window.RokSite || {};
  const modal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const videoIframe = document.getElementById('video-iframe');
  const modalTitle = document.getElementById('modal-title');

  const openVideo = (id, title) => {
    if (!modal || !videoIframe || !id) return;
    videoIframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    if (modalTitle) modalTitle.textContent = title || '';
    modal.showModal();
    body.classList.add('modal-open');
  };

  const closeVideo = () => {
    if (!modal) return;
    if (videoIframe) videoIframe.src = '';
    modal.close();
    body.classList.remove('modal-open');
  };

  document.querySelectorAll('[data-video]').forEach(trigger => {
    trigger.addEventListener('click', () => openVideo(trigger.dataset.video, trigger.dataset.title));
  });
  modalClose?.addEventListener('click', closeVideo);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeVideo();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.open) closeVideo();
  });

  const hero = document.querySelector('.hero-scene');
  // The Play Reel graphic replaces the pointer on desktop, so clicking
  // the hero itself opens the showreel, excluding actual navigation links.
  hero?.addEventListener('click', event => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    if (event.target.closest('a, button')) return;
    document.querySelector('.hero-reel')?.click();
  });
  const heroDepth = hero ? [...hero.querySelectorAll('[data-depth]')] : [];
  const heroLoop = document.querySelector('.hero-loop');
  const caveBridge = document.querySelector('.cave-bridge');
  const caveStage = caveBridge?.querySelector('.cave-stage');
  const caveBg = caveBridge?.querySelector('.cave-bg');
  const caveTop = caveBridge?.querySelector('.cave-rock-top');
  const caveBottom = caveBridge?.querySelector('.cave-rock-bottom');
  const featuredWork = document.getElementById('work');
  const heroScroll = hero?.querySelector('.hero-scroll');
  const desktopCave = matchMedia('(min-width:768px)');
  const motionPreference = matchMedia('(prefers-reduced-motion:reduce)');
  const finePointer = window.matchMedia('(pointer:fine)');
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
  const easeBetween = (start,end,value) => {
    const t = clamp((value - start) / (end - start),0,1);
    return t * t * (3 - 2 * t);
  };
  let ticking = false;

  const updateMotion = () => {
    ticking = false;
    if (motionPreference.matches) return;

    if (hero) {
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height,1),0,1);
      heroDepth.forEach(el => {
        const d = Number(el.dataset.depth || 1);
        el.style.setProperty('--depth-scroll', `${p * -32 * d}px`);
      });
      if (heroLoop) heroLoop.style.transform = `scale(1.035) translate3d(0,${p * 28}px,0)`;
    }

    if (caveBridge && caveStage && caveBg && caveTop && caveBottom) {
      const r = caveBridge.getBoundingClientRect();
      if (desktopCave.matches) {
        // Complete the rock wipe as Featured Work starts entering beneath it.
        const handoff = featuredWork?.getBoundingClientRect().top ?? r.bottom;
        const travel = Math.max(handoff - r.top - caveStage.offsetHeight,1);
        const progress = clamp(-r.top / travel,0,1);
        caveBridge.style.setProperty('--cave-open', easeBetween(.06,.58,progress));
        caveBridge.style.setProperty('--cave-push', easeBetween(.23,1,progress));
        caveBridge.style.setProperty('--cave-exit', easeBetween(.71,1,progress));
        return;
      }
      const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height),0,1);
      caveBg.style.transform = `scale(1.06) translate3d(0,${(p - .5) * -38}px,0)`;
      caveTop.style.setProperty('--cave-shift', `${(p - .5) * 44}px`);
      caveBottom.style.setProperty('--cave-shift', `${(p - .5) * -34}px`);
    }
  };

  const requestMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateMotion);
  };

  const syncCaveMode = () => {
    const active = desktopCave.matches && !motionPreference.matches;
    caveBridge?.classList.toggle('is-parallax',active);
    caveBg?.style.removeProperty('transform');
    caveTop?.style.removeProperty('--cave-shift');
    caveBottom?.style.removeProperty('--cave-shift');
    heroScroll?.setAttribute('href',active ? '#cave' : '#work');
    requestMotion();
  };
  desktopCave.addEventListener('change', syncCaveMode);
  motionPreference.addEventListener('change', syncCaveMode);
  window.addEventListener('scroll', requestMotion, { passive:true });
  window.addEventListener('resize', requestMotion, { passive:true });
  syncCaveMode();

  if (!reduceMotion) {
    hero?.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      const r = hero.getBoundingClientRect();
      const nx = ((event.clientX - r.left) / r.width - .5) * 2;
      const ny = ((event.clientY - r.top) / r.height - .5) * 2;
      heroDepth.forEach(el => {
        const d = Number(el.dataset.depth || 1);
        el.style.setProperty('--depth-x', `${nx * 11 * d}px`);
        el.style.setProperty('--depth-y', `${ny * 7 * d}px`);
      });
    });

    hero?.addEventListener('pointerleave', () => {
      heroDepth.forEach(el => {
        el.style.setProperty('--depth-x','0px');
        el.style.setProperty('--depth-y','0px');
      });
    });
  }

  const featuredVideo = document.getElementById('featured-video');
  const featuredItems = [...document.querySelectorAll('[data-featured]')];
  const featuredPoster = document.getElementById('featured-poster');
  const btsVideo = document.querySelector('.bts-video');
  const heroVideo = document.querySelector('.hero-loop');

  const markPlayback = video => {
    if (!video) return;
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    for (const eventName of ['error', 'stalled', 'emptied']) {
      video.addEventListener(eventName, () => video.classList.remove('is-playing'));
    }
    if (video.readyState >= 3 && !video.paused) video.classList.add('is-playing');
  };
  [featuredVideo, btsVideo, heroVideo].forEach(markPlayback);
  const watchLoop = (video, source = () => video.dataset.loopSrc) => {
    if (!video || reduceMotion) return () => {};
    let nearViewport = !('IntersectionObserver' in window);
    const sync = () => {
      if (!nearViewport || document.hidden) {
        video.pause();
        return;
      }
      const src = source();
      if (!src) return;
      const changed = video.getAttribute('src') !== src;
      if (changed) video.src = src;
      if (changed || video.paused) video.play().catch(() => {});
    };
    if (!nearViewport) {
      new IntersectionObserver(([entry]) => {
        nearViewport = entry.isIntersecting;
        sync();
      }, { rootMargin: '100px' }).observe(video);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
    return sync;
  };
  const mobileHero = window.matchMedia('(max-width:767px)');
  const refreshHero = watchLoop(heroVideo, () => mobileHero.matches ? heroVideo.dataset.mobileSrc : heroVideo.dataset.loopSrc);
  mobileHero.addEventListener('change', refreshHero);
  watchLoop(btsVideo);

  const featuredMeta = document.getElementById('featured-meta');
  const featuredYear = document.getElementById('featured-year');
  let activeFeatured = featuredItems[0] || null;
  let queuedFeatured = activeFeatured;
  const refreshFeatured = watchLoop(featuredVideo, () => queuedFeatured?.dataset.src);
  let switchTimer = 0;

  const activateFeatured = item => {
    if (!item || item === activeFeatured) return;
    activeFeatured = item;
    featuredItems.forEach(el => el.classList.toggle('is-active',el === item));
    if (featuredMeta) featuredMeta.textContent = item.dataset.meta || '';
    if (featuredPoster) featuredPoster.src = item.dataset.poster || featuredPoster.src;
    featuredVideo?.pause();
    featuredVideo?.classList.remove('is-playing');
    if (featuredYear) featuredYear.textContent = item.dataset.year || '';

    if (!featuredVideo || reduceMotion) return;
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => {
      queuedFeatured = item;
      featuredVideo.poster = item.dataset.poster || '';
      refreshFeatured();
    }, 120);
  };

  featuredItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (finePointer.matches) activateFeatured(item);
    });
    item.addEventListener('focus', () => activateFeatured(item));
    item.addEventListener('click', () => activateFeatured(item));
  });

  const logoWindow = document.getElementById('client-logo-window');
  const logoArrows = [...document.querySelectorAll('[data-logo-step]')];
  if (logoWindow && logoArrows.length) {
    const ribbon = logoWindow.closest('.logo-ribbon');
    const track = logoWindow.querySelector('.logo-track');
    const logos = [...track.children];
    const loopMode = matchMedia('(min-width:768px) and (prefers-reduced-motion:no-preference)');
    let period = 0;
    let position = 0;
    let lastTime;
    let lastScroll = logoWindow.scrollLeft;
    let frame;
    let nudge;
    let inView = false;
    const duplicates = [];
    const wrap = value => ((value % period) + period) % period;

    const syncLogoArrows = () => {
      const max = logoWindow.scrollWidth - logoWindow.clientWidth;
      logoArrows.forEach(button => {
        button.disabled = !period && (Number(button.dataset.logoStep) < 0
          ? logoWindow.scrollLeft <= 1 : logoWindow.scrollLeft >= max - 1);
      });
    };
    const tick = time => {
      const elapsed = lastTime === undefined ? 0 : Math.min(time - lastTime, 40);
      lastTime = time;
      if (nudge) {
        const progress = Math.min((time - nudge.start) / 450, 1);
        position = nudge.from + (nudge.to - nudge.from) * (1 - (1 - progress) ** 3);
        if (progress === 1) nudge = null;
      } else if (logoWindow.scrollLeft !== lastScroll) {
        position = logoWindow.scrollLeft;
      } else if (!logoWindow.matches(':hover,:has(:focus-visible)')) {
        position += elapsed * .033;
      }
      logoWindow.scrollLeft = wrap(position);
      lastScroll = logoWindow.scrollLeft;
      frame = requestAnimationFrame(tick);
    };
    const syncLoop = () => {
      cancelAnimationFrame(frame);
      lastTime = undefined;
      if (period && inView && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const configureLoop = () => {
      const fraction = period ? wrap(position) / period : 0;
      const looping = loopMode.matches;
      logoWindow.classList.toggle('is-looping', looping);
      period = looping ? logos.length * logos[0].getBoundingClientRect().width : 0;
      const needed = period ? Math.ceil(logoWindow.clientWidth / period) * logos.length : 0;
      while (duplicates.length < needed) {
        const clone = logos[duplicates.length % logos.length].cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        duplicates.push(clone);
        track.append(clone);
      }
      while (duplicates.length > needed) duplicates.pop().remove();
      nudge = null;
      position = fraction * period;
      if (period) logoWindow.scrollLeft = position;
      lastScroll = logoWindow.scrollLeft;
      syncLogoArrows();
      syncLoop();
    };
    logoArrows.forEach(button => button.addEventListener('click', () => {
      const step = Number(button.dataset.logoStep);
      const width = logos[0].offsetWidth;
      if (period) {
        const target = nudge?.to ?? position;
        nudge = { from:position, to:target + step * width * 2, start:performance.now() };
      } else {
        logoWindow.scrollBy({ left:step * Math.max(1, Math.floor(logoWindow.clientWidth / width)) * width,
          behavior:reduceMotion ? 'instant' : 'smooth' });
      }
    }));
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    });
    visibility.observe(ribbon);
    document.addEventListener('visibilitychange', syncLoop);
    logoWindow.addEventListener('scroll', () => { if (!period) syncLogoArrows(); }, { passive:true });
    new ResizeObserver(configureLoop).observe(logoWindow);
    loopMode.addEventListener('change', configureLoop);
    configureLoop();
  }

  const carousel = document.getElementById('testimonials');
  if (carousel) {
    const cards = [...carousel.querySelectorAll('.testimonial-card')];
    const count = document.getElementById('testimonial-current');
    const mobile = matchMedia('(max-width:767px)');
    let index = Math.max(0,cards.findIndex(card => card.classList.contains('is-center')));
    let timer;
    let interacted = false;

    const move = step => {
      if (!cards.length) return;
      index = (index + step + cards.length) % cards.length;
      cards.forEach((card, position) => card.classList.toggle('is-center', position === index));
      if (count) count.textContent = String(index + 1);
    };
    const syncAutoplay = () => {
      clearInterval(timer);
      if (mobile.matches && !reduceMotion && !interacted && cards.length > 1) {
        timer = setInterval(() => move(1), 9000);
      }
    };
    carousel.addEventListener('click', event => {
      if (!mobile.matches) return;
      const arrow = event.target.closest('.testimonial-arrow');
      if (arrow) move(arrow.classList.contains('testimonial-prev') ? -1 : 1);
      if (arrow || event.target.closest('.testimonial-card')) {
        interacted = true;
        syncAutoplay();
      }
    });
    mobile.addEventListener('change', syncAutoplay);
    syncAutoplay();
  }
})();
