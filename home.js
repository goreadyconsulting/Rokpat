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
  const caveBg = caveBridge?.querySelector('.cave-bg');
  const heroScroll = hero?.querySelector('.hero-scroll');
  const desktopLayout = matchMedia('(min-width:768px)');
  const motionPreference = matchMedia('(prefers-reduced-motion:reduce)');
  const finePointer = window.matchMedia('(pointer:fine)');
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
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

    if (caveBridge && caveBg) {
      const r = caveBridge.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (desktopLayout.matches) {
        const progress = clamp(-r.top / Math.max(r.height - viewport,1),0,1);
        caveBg.style.transform = `translateY(${(.5 - progress) * viewport * .1}px) scale(1.12)`;
      } else {
        const progress = clamp((viewport - r.top) / (viewport + r.height),0,1);
        caveBg.style.transform = `scale(1.06) translate3d(0,${(progress - .5) * -38}px,0)`;
      }
    }
  };

  const requestMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateMotion);
  };

  const syncCaveMode = () => {
    const active = desktopLayout.matches && !motionPreference.matches;
    caveBridge?.classList.toggle('is-parallax',active);
    caveBg?.style.removeProperty('transform');
    heroScroll?.setAttribute('href',active ? '#cave' : '#work');
    requestMotion();
  };
  desktopLayout.addEventListener('change', syncCaveMode);
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

  const testimonials = document.getElementById('testimonials');
  const stage = testimonials.querySelector('.testimonial-stage');
  const cards = [...testimonials.querySelectorAll('.testimonial-card')];
  const rotationButton = testimonials.querySelector('.testimonial-toggle');
  const count = document.getElementById('testimonial-current');
  let selected = cards.findIndex(card => card.classList.contains('is-center'));
  let autoAdvance;
  let inView = false;
  let paused = false;

  const showTestimonial = index => {
    const animate = index !== selected && desktopLayout.matches && !motionPreference.matches;
    const previous = animate ? cards.map(card => ({
      bounds:card.getBoundingClientRect(),
      opacity:getComputedStyle(card).opacity
    })) : [];
    cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    selected = (index + cards.length) % cards.length;
    cards.forEach((card, position) => {
      const offset = (position - selected + cards.length) % cards.length;
      card.classList.toggle('is-center', offset === 0);
      card.classList.toggle('is-right', offset === 1);
      card.classList.toggle('is-left', offset === cards.length - 1);
      card.classList.toggle('is-hidden', offset > 1 && offset < cards.length - 1);
    });
    count.textContent = String(selected + 1);
    if (!animate) return;

    cards.forEach((card, position) => {
      const next = card.getBoundingClientRect();
      if (!next.width) return;
      const { bounds, opacity } = previous[position];
      const targetOpacity = getComputedStyle(card).opacity;
      const transform = bounds.width
        ? `translate(${bounds.x - next.x}px,${bounds.y - next.y}px) scale(${bounds.width / next.width},${bounds.height / next.height})`
        : 'none';
      card.animate([
        { transform, transformOrigin:'top left', opacity:bounds.width ? opacity : 0 },
        { transform:'none', transformOrigin:'top left', opacity:targetOpacity }
      ], { duration:500, easing:'cubic-bezier(.22,.75,.22,1)' });
    });
  };

  testimonials.addEventListener('click', event => {
    if (!desktopLayout.matches) return;
    if (event.target.closest('.testimonial-toggle')) paused = !paused;
    else if (event.target.closest('.testimonial-prev')) showTestimonial(selected - 1);
    else if (event.target.closest('.testimonial-next')) showTestimonial(selected + 1);
    else {
      const position = cards.indexOf(event.target.closest('.testimonial-card'));
      if (position < 0 || position === selected) return;
      showTestimonial(position);
    }
    syncTestimonials();
  });
  showTestimonial(selected);

  const syncTestimonials = () => {
    clearInterval(autoAdvance);
    const canRotate = desktopLayout.matches && !motionPreference.matches;
    if (!canRotate) {
      cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    }
    rotationButton.hidden = !canRotate;
    const action = paused ? 'Play' : 'Pause';
    rotationButton.textContent = action;
    rotationButton.setAttribute('aria-label', `${action} testimonial rotation`);
    stage.setAttribute('aria-live', canRotate && !paused ? 'off' : 'polite');
    if (canRotate && inView && !paused && !document.hidden) {
      autoAdvance = setInterval(() => showTestimonial(selected + 1), 9000);
    }
  };
  new IntersectionObserver(([entry]) => {
    inView = entry.intersectionRatio >= .4;
    syncTestimonials();
  }, { threshold:.4 }).observe(stage);
  document.addEventListener('visibilitychange', syncTestimonials);
  desktopLayout.addEventListener('change', syncTestimonials);
  motionPreference.addEventListener('change', syncTestimonials);
  syncTestimonials();
})();
