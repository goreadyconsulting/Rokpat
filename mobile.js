(() => {
  const process = document.querySelector('.process-steps');
  if (!process) return;

  const phone = matchMedia('(max-width:767px)');
  const steps = [...process.querySelectorAll('.process-step')].map(item => {
    const title = item.querySelector('.process-front');
    const detail = item.querySelector('.process-back');
    const label = [...title.childNodes];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'phone-process-toggle';
    button.setAttribute('aria-controls', detail.id);
    const icon = document.createElement('span');
    icon.className = 'phone-process-icon';
    icon.setAttribute('aria-hidden', 'true');
    return {title, detail, label, button, icon};
  });

  const show = active => {
    for (const step of steps) {
      const expanded = step === active;
      step.detail.hidden = !expanded;
      step.button.setAttribute('aria-expanded', String(expanded));
      step.icon.textContent = expanded ? '−' : '+';
    }
  };

  for (const step of steps) {
    step.button.addEventListener('click', () => show(step.detail.hidden ? step : null));
  }

  const sync = () => {
    if (phone.matches) {
      process.classList.add('is-phone-accordion');
      for (const {title, label, button, icon} of steps) {
        button.replaceChildren(...label, icon);
        title.append(button);
      }
      show(steps[0]);
    } else if (process.classList.contains('is-phone-accordion')) {
      process.classList.remove('is-phone-accordion');
      for (const {title, detail, label} of steps) {
        title.replaceChildren(...label);
        detail.hidden = false;
      }
    }
  };

  phone.addEventListener('change', sync);
  sync();
})();
