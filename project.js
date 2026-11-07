(() => {
  const media = document.getElementById('project-media');
  const play = media?.querySelector('[data-video-id]');
  if (!play) return;

  play.addEventListener('click', event => {
    const id = play.dataset.videoId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.title = play.dataset.videoTitle;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    media.replaceChildren(frame);
    frame.focus();
  });
})();
