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

  document.querySelectorAll('[data-video]:not([data-work-row]):not([data-mobile-project])').forEach(trigger => {
    trigger.addEventListener('click', () => openVideo(trigger.dataset.video, trigger.dataset.title));
  });

  modalClose?.addEventListener('click', closeVideo);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeVideo();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.open) closeVideo();
  });

  const workRows = [...document.querySelectorAll('[data-work-row]')];
  const preview = document.querySelector('.work-preview');
  const previewPoster = document.getElementById('work-preview-poster');
  const previewVideo = document.getElementById('work-preview-video');
  const previewTitle = document.getElementById('work-preview-title');
  const previewMeta = document.getElementById('work-preview-meta');
  const previewPlay = document.getElementById('preview-play');
  const finePointer = window.matchMedia('(pointer:fine)');
  let activeWorkRow = workRows[0] || null;
  let previewTimer = 0;

  const unloadPreviewVideo = () => {
    window.clearTimeout(previewTimer);
    if (previewVideo) previewVideo.src = '';
    preview?.classList.remove('is-video');
  };

  const activatePreview = (row, playLoop = false) => {
    if (!row || row.classList.contains('is-filtered')) return;
    activeWorkRow = row;
    workRows.forEach(item => item.classList.toggle('is-active', item === row));

    if (previewPoster && row.dataset.poster && previewPoster.src !== row.dataset.poster) {
      previewPoster.src = row.dataset.poster;
    }
    if (previewTitle) previewTitle.textContent = row.dataset.title || '';
    if (previewMeta) {
      previewMeta.textContent = [row.dataset.meta, row.dataset.year].filter(Boolean).join(' / ');
    }

    unloadPreviewVideo();
    if (!playLoop || reduceMotion || !previewVideo || !row.dataset.video) return;

    const id = row.dataset.video;
    previewTimer = window.setTimeout(() => {
      if (activeWorkRow !== row) return;
      previewVideo.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0&modestbranding=1&playsinline=1&disablekb=1`;
      preview?.classList.add('is-video');
    }, 260);
  };

  workRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      if (finePointer.matches) activatePreview(row, true);
    });
    row.addEventListener('focus', () => activatePreview(row, finePointer.matches));
    row.addEventListener('click', () => {
      if (finePointer.matches) openVideo(row.dataset.video, row.dataset.title);
      else activatePreview(row, true);
    });
  });

  document.getElementById('work-browser')?.addEventListener('mouseleave', () => {
    if (finePointer.matches) unloadPreviewVideo();
  });

  previewPlay?.addEventListener('click', () => {
    if (activeWorkRow) openVideo(activeWorkRow.dataset.video, activeWorkRow.dataset.title);
  });

  const filterButtons = document.querySelectorAll('[data-filter]');
  const mobileProjects = [...document.querySelectorAll('[data-mobile-project]')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => item.classList.toggle('is-active', item === button));

      workRows.forEach(row => {
        const categories = (row.dataset.category || '').split(' ');
        row.classList.toggle('is-filtered', filter !== 'all' && !categories.includes(filter));
      });

      mobileProjects.forEach(card => {
        const categories = (card.dataset.category || '').split(' ');
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });

      const nextRow = workRows.find(row => !row.classList.contains('is-filtered'));
      if (nextRow) activatePreview(nextRow, finePointer.matches);
    });
  });

  const stopInlinePlayers = exceptMedia => {
    document.querySelectorAll('.mobile-media.is-playing').forEach(media => {
      if (media === exceptMedia) return;
      media.querySelector('iframe')?.remove();
      media.classList.remove('is-playing');
    });
  };

  document.querySelectorAll('.mobile-inline-play').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const card = button.closest('[data-mobile-project]');
      const media = button.closest('.mobile-media');
      const id = card?.dataset.video;
      if (!card || !media || !id) return;

      stopInlinePlayers(media);
      if (media.classList.contains('is-playing')) return;

      const iframe = document.createElement('iframe');
      iframe.title = card.dataset.title || 'Project video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      media.appendChild(iframe);
      media.classList.add('is-playing');
    });
  });

  if ('IntersectionObserver' in window) {
    const inlineObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0.15) return;
        const media = entry.target.querySelector('.mobile-media');
        if (media?.classList.contains('is-playing')) {
          media.querySelector('iframe')?.remove();
          media.classList.remove('is-playing');
        }
      });
    }, { threshold: [0, 0.15, 0.6] });
    mobileProjects.forEach(card => inlineObserver.observe(card));
  }

  const heroScene = document.querySelector('.hero-scene');
  const heroDepthElements = heroScene ? [...heroScene.querySelectorAll('[data-depth]')] : [];
  const workBrowser = document.getElementById('work-browser');
  const workStage = document.getElementById('work-stage');
  const workList = document.getElementById('work-list');
  const workPreview = document.querySelector('.work-preview');
  const mobileMedia = [...document.querySelectorAll('.mobile-media')];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let parallaxTicking = false;

  const updateParallax = () => {
    parallaxTicking = false;
    if (reduceMotion) return;

    if (heroScene) {
      const rect = heroScene.getBoundingClientRect();
      const progress = clamp((-rect.top + (header?.offsetHeight || 0)) / Math.max(rect.height, 1), 0, 1);

      heroDepthElements.forEach(el => {
        const depth = Number(el.dataset.depth || 1);
        const direction = el.classList.contains('hero-orbit-b') ? 1 : -1;
        el.style.setProperty('--depth-scroll', `${progress * 46 * depth * direction}px`);
      });
    }

    if (workBrowser && workStage && workList && window.innerWidth >= 768) {
      const rect = workBrowser.getBoundingClientRect();
      const headerHeight = header?.offsetHeight || 0;
      const scrollDistance = Math.max(workBrowser.offsetHeight - workStage.offsetHeight, 1);
      const progress = clamp((headerHeight - rect.top) / scrollDistance, 0, 1);
      const visibleRows = workRows.filter(row => !row.classList.contains('is-filtered'));

      if (visibleRows.length) {
        const first = visibleRows[0];
        const last = visibleRows[visibleRows.length - 1];
        const firstCenter = first.offsetTop + first.offsetHeight / 2;
        const lastCenter = last.offsetTop + last.offsetHeight / 2;
        const travel = Math.max(lastCenter - firstCenter, 0);
        workList.style.setProperty('--work-list-y', `${(0.5 - progress) * travel}px`);

        const activeIndex = Math.round(progress * (visibleRows.length - 1));
        const nextActive = visibleRows[activeIndex];
        if (nextActive && nextActive !== activeWorkRow) activatePreview(nextActive, true);
      }

      workPreview?.style.setProperty('--work-scroll-y', `${(progress - 0.5) * -64}px`);
    }

    if (window.innerWidth < 768) {
      mobileMedia.forEach(media => {
        const rect = media.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = (center - window.innerHeight / 2) / Math.max(window.innerHeight, 1);
        media.style.setProperty('--mobile-parallax-y', `${clamp(delta * -30, -22, 22)}px`);
      });
    }
  };

  const requestParallax = () => {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  };

  if (!reduceMotion) {
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });

    heroScene?.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      const rect = heroScene.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      heroDepthElements.forEach(el => {
        const depth = Number(el.dataset.depth || 1);
        el.style.setProperty('--depth-x', `${nx * 14 * depth}px`);
        el.style.setProperty('--depth-y', `${ny * 8 * depth}px`);
      });
    });

    heroScene?.addEventListener('pointerleave', () => {
      heroDepthElements.forEach(el => {
        el.style.setProperty('--depth-x', '0px');
        el.style.setProperty('--depth-y', '0px');
      });
    });

    workStage?.addEventListener('pointermove', event => {
      if (!finePointer.matches || !workPreview) return;
      const rect = workStage.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      workPreview.style.setProperty('--work-mouse-x', `${nx * 18}px`);
      workPreview.style.setProperty('--work-mouse-y', `${ny * 10}px`);
    });

    workStage?.addEventListener('pointerleave', () => {
      workPreview?.style.setProperty('--work-mouse-x', '0px');
      workPreview?.style.setProperty('--work-mouse-y', '0px');
    });

    requestParallax();
  }

  const testimonials = [...document.querySelectorAll('.testimonial')];
  const prev = document.querySelector('[data-testimonial-prev]');
  const next = document.querySelector('[data-testimonial-next]');
  let testimonialIndex = 0;

  const showTestimonial = index => {
    if (!testimonials.length) return;
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle('is-active', i === testimonialIndex));
  };

  prev?.addEventListener('click', () => showTestimonial(testimonialIndex - 1));
  next?.addEventListener('click', () => showTestimonial(testimonialIndex + 1));
})();