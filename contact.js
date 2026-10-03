(() => {
  const { reduceMotion = false } = window.RokSite || {};
  const stage = document.getElementById('contact-stage');
  const followers = stage ? [...stage.querySelectorAll('.contact-follower')] : [];
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  if (stage && followers.length) {
    followers.forEach((el, index) => {
      el.classList.toggle('is-active', index === 0);
    });

    if (finePointer && !reduceMotion) {
      const bounds = stage.getBoundingClientRect();
      let activeIndex = 0;
      let x = bounds.width * .5;
      let y = bounds.height * .5;
      let tx = x;
      let ty = y;
      let lastSwapX = x;
      let lastSwapY = y;
      let lastPointerX = x;
      let lastPointerY = y;
      let rotation = -4;
      let idleTimer = 0;
      let raf = 0;

      const activeEl = () => followers[activeIndex];

      const switchImage = () => {
        followers[activeIndex].classList.remove('is-active');
        activeIndex = (activeIndex + 1) % followers.length;
        const next = followers[activeIndex];
        next.classList.add('is-active');
        next.style.transform = `translate3d(${x - next.offsetWidth / 2}px,${y - next.offsetHeight / 2}px,0) rotate(${rotation}deg)`;
      };

      const animate = () => {
        x += (tx - x) * .14;
        y += (ty - y) * .14;

        const el = activeEl();
        if (el) {
          const px = x - el.offsetWidth / 2;
          const py = y - el.offsetHeight / 2;
          el.style.transform = `translate3d(${px}px,${py}px,0) rotate(${rotation}deg)`;
        }

        raf = requestAnimationFrame(animate);
      };

      stage.addEventListener('pointerenter', event => {
        const r = stage.getBoundingClientRect();
        tx = event.clientX - r.left;
        ty = event.clientY - r.top;
        x = tx;
        y = ty;
        lastSwapX = tx;
        lastSwapY = ty;
        lastPointerX = tx;
        lastPointerY = ty;
        stage.classList.add('is-pointer-active');
      });

      stage.addEventListener('pointermove', event => {
        const r = stage.getBoundingClientRect();
        tx = event.clientX - r.left;
        ty = event.clientY - r.top;

        const dx = tx - lastPointerX;
        const dy = ty - lastPointerY;
        rotation = Math.max(-8, Math.min(8, dx * .12 + dy * .035));

        const travel = Math.hypot(tx - lastSwapX, ty - lastSwapY);
        if (travel > 155) {
          switchImage();
          lastSwapX = tx;
          lastSwapY = ty;
        }

        lastPointerX = tx;
        lastPointerY = ty;

        stage.classList.add('is-pointer-active');
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          stage.classList.remove('is-pointer-active');
        }, 1400);
      }, { passive:true });

      stage.addEventListener('pointerleave', () => {
        stage.classList.remove('is-pointer-active');
      });

      animate();
      window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once:true });
    } else {
      const positions = [
        ['18%','21%'], ['77%','19%'], ['76%','72%'],
        ['22%','73%'], ['50%','18%'], ['52%','76%']
      ];
      let activeIndex = 0;

      const placeActive = () => {
        followers.forEach((el, index) => {
          const active = index === activeIndex;
          el.classList.toggle('is-active', active);
          if (active) {
            const [left, top] = positions[index % positions.length];
            el.style.left = left;
            el.style.top = top;
          }
        });
      };

      placeActive();

      if (!reduceMotion) {
        window.setInterval(() => {
          activeIndex = (activeIndex + 1) % followers.length;
          placeActive();
        }, 3200);
      }
    }
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const type = String(formData.get('projectType') || '').trim();
      const message = String(formData.get('message') || '').trim();

      const subject = encodeURIComponent(
        `Project enquiry${type ? ` - ${type}` : ''}${name ? ` - ${name}` : ''}`
      );
      const bodyText = [
        name ? `Name: ${name}` : '',
        email ? `Email: ${email}` : '',
        type ? `Project type: ${type}` : '',
        '',
        message
      ].filter((line,index) => line || index === 3).join('\n');

      window.location.href =
        `mailto:rokpat.dm@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    });
  }
})();