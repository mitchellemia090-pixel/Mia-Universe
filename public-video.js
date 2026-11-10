(() => {
  const site = new URL('.', document.currentScript.src);
  const configureVideos = () => {
    for (const video of document.querySelectorAll('video[data-public-src]:not([data-public-ready])')) {
      const address = window.MIA_PUBLIC_MEDIA?.[video.dataset.publicSrc];
      if (!address) continue;
      const url = new URL(address, site);
      if (url.protocol !== 'https:' && url.origin !== location.origin) continue;
      video.src = url.href;
      video.hidden = false;
      video.dataset.publicReady = '';
    }
  };
  configureVideos();
  new MutationObserver(configureVideos).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', event => {
    const jump = event.target.closest('[data-video-seek]');
    const player = document.querySelector('video[data-public-src]');
    if (!jump || !player?.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelector('.public-video-access a')?.focus();
  }, true);
})();
