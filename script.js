(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const modal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const videoIframe = document.getElementById('video-iframe');
  const modalTitle = document.getElementById('modal-title');
  const year = document.getElementById('year');

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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  if (modalClose) modalClose.addEventListener('click', closeVideo);
  if (modal) modal.addEventListener('click', event => {
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

    if (previewPoster && row.dataset.poster) {
      if (previewPoster.src !== row.dataset.poster) previewPoster.src = row.dataset.poster;
    }
    if (previewTitle) previewTitle.textContent = row.dataset.title || '';
    if (previewMeta) {
      const bits = [row.dataset.meta, row.dataset.year].filter(Boolean);
      previewMeta.textContent = bits.join(' / ');
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
      if (finePointer.matches) {
        openVideo(row.dataset.video, row.dataset.title);
      } else {
        activatePreview(row, true);
      }
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

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const type = String(formData.get('projectType') || '').trim();
      const message = String(formData.get('message') || '').trim();
      const subject = encodeURIComponent(`Project enquiry${type ? ` - ${type}` : ''}${name ? ` - ${name}` : ''}`);
      const bodyText = [
        name ? `Name: ${name}` : '',
        email ? `Email: ${email}` : '',
        type ? `Project type: ${type}` : '',
        '',
        message
      ].filter((line, index) => line || index === 3).join('\n');
      window.location.href = `mailto:rokpat.dm@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    });
  }
})();
