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
  const heroDepth = hero ? [...hero.querySelectorAll('[data-depth]')] : [];
  const heroLoop = document.querySelector('.hero-loop');
  const caveBridge = document.querySelector('.cave-bridge');
  const caveBg = caveBridge?.querySelector('.cave-bg');
  const caveTop = caveBridge?.querySelector('.cave-rock-top');
  const caveBottom = caveBridge?.querySelector('.cave-rock-bottom');
  const finePointer = window.matchMedia('(pointer:fine)');
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
  let ticking = false;

  const updateMotion = () => {
    ticking = false;
    if (reduceMotion) return;

    if (hero) {
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height,1),0,1);
      heroDepth.forEach(el => {
        const d = Number(el.dataset.depth || 1);
        el.style.setProperty('--depth-scroll', `${p * -32 * d}px`);
      });
      if (heroLoop) heroLoop.style.transform = `scale(1.035) translate3d(0,${p * 28}px,0)`;
    }

    if (caveBridge && caveBg && caveTop && caveBottom) {
      const r = caveBridge.getBoundingClientRect();
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

  if (!reduceMotion) {
    window.addEventListener('scroll', requestMotion, { passive:true });
    window.addEventListener('resize', requestMotion, { passive:true });

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

    requestMotion();
  }

  const featuredVideo = document.getElementById('featured-video');
  const featuredItems = [...document.querySelectorAll('[data-featured]')];
  const featuredMeta = document.getElementById('featured-meta');
  const featuredYear = document.getElementById('featured-year');
  let activeFeatured = featuredItems[0] || null;
  let switchTimer = 0;

  const activateFeatured = item => {
    if (!item || item === activeFeatured) return;
    activeFeatured = item;
    featuredItems.forEach(el => el.classList.toggle('is-active',el === item));
    if (featuredMeta) featuredMeta.textContent = item.dataset.meta || '';
    if (featuredYear) featuredYear.textContent = item.dataset.year || '';

    if (!featuredVideo) return;
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => {
      const src = item.dataset.src;
      if (!src) return;
      featuredVideo.pause();
      featuredVideo.poster = item.dataset.poster || '';
      featuredVideo.src = src;
      featuredVideo.load();
      const play = featuredVideo.play();
      if (play && typeof play.catch === 'function') play.catch(() => {});
    }, 120);
  };

  featuredItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (finePointer.matches) activateFeatured(item);
    });
    item.addEventListener('focus', () => activateFeatured(item));
    item.addEventListener('click', () => activateFeatured(item));
  });

  const cards = [...document.querySelectorAll('.testimonial-card')];
  const prev = document.querySelector('.testimonial-prev');
  const next = document.querySelector('.testimonial-next');
  const count = document.getElementById('testimonial-current');
  let testimonialIndex = Math.max(0,cards.findIndex(c => c.classList.contains('is-center')));

  const renderTestimonials = () => {
    const n = cards.length;
    cards.forEach((card,index) => {
      const d = (index - testimonialIndex + n) % n;
      card.classList.remove('is-left','is-center','is-right','is-hidden');
      if (d === 0) card.classList.add('is-center');
      else if (d === 1) card.classList.add('is-right');
      else if (d === n - 1) card.classList.add('is-left');
      else card.classList.add('is-hidden');
    });
    if (count) count.textContent = String(testimonialIndex + 1);
  };

  const moveTestimonial = step => {
    if (!cards.length) return;
    testimonialIndex = (testimonialIndex + step + cards.length) % cards.length;
    renderTestimonials();
  };

  prev?.addEventListener('click', () => moveTestimonial(-1));
  next?.addEventListener('click', () => moveTestimonial(1));
  cards.forEach((card,index) => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('is-center')) {
        testimonialIndex = index;
        renderTestimonials();
      }
    });
  });
  renderTestimonials();

  let autoTestimonial = 0;
  if (!reduceMotion && cards.length > 1) {
    autoTestimonial = window.setInterval(() => moveTestimonial(1), 9000);
    const stopAuto = () => {
      if (autoTestimonial) {
        clearInterval(autoTestimonial);
        autoTestimonial = 0;
      }
    };
    prev?.addEventListener('click',stopAuto,{once:true});
    next?.addEventListener('click',stopAuto,{once:true});
    cards.forEach(card => card.addEventListener('click',stopAuto,{once:true}));
  }
})();