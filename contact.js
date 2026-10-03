(() => {
  const { reduceMotion = false } = window.RokSite || {};
  const stage = document.getElementById('contact-stage');
  const followers = stage ? [...stage.querySelectorAll('.contact-follower')] : [];
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const canAnimatePointer = stage && followers.length && finePointer && !reduceMotion;

  if (canAnimatePointer) {
    const rect = stage.getBoundingClientRect();
    const startX = rect.width * .5;
    const startY = rect.height * .5;
    const state = followers.map((el, index) => ({
      el,
      x:startX,
      y:startY,
      tx:startX,
      ty:startY,
      ease:Math.max(.045, .18 - index * .022),
      ox:[-120,110,-180,165,-80,200][index] || 0,
      oy:[-90,-135,115,105,175,-10][index] || 0,
      rot:[-8,7,-5,9,-7,5][index] || 0
    }));

    let pointerX = startX;
    let pointerY = startY;
    let frame = 0;
    let idleTimer = 0;

    const animate = () => {
      const bounds = stage.getBoundingClientRect();
      state.forEach((item,index) => {
        const depth = 1 - index * .075;
        item.tx = pointerX + item.ox * depth;
        item.ty = pointerY + item.oy * depth;
        item.x += (item.tx - item.x) * item.ease;
        item.y += (item.ty - item.y) * item.ease;

        const px = item.x - item.el.offsetWidth / 2;
        const py = item.y - item.el.offsetHeight / 2;
        const drift = Math.sin(frame * .018 + index) * 3;
        item.el.style.transform =
          `translate3d(${px}px,${py}px,0) rotate(${item.rot + drift}deg)`;
      });
      frame += 1;
      requestAnimationFrame(animate);
    };

    stage.addEventListener('pointerenter', () => {
      stage.classList.add('is-pointer-active');
    });

    stage.addEventListener('pointermove', event => {
      const bounds = stage.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      stage.classList.add('is-pointer-active');
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        stage.classList.remove('is-pointer-active');
      }, 1700);
    }, { passive:true });

    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('is-pointer-active');
    });

    animate();
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