// Registers the service worker relative to wherever this script is loaded
// from, so it works whether the page is the hub or a game two folders deep.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', document.querySelector('link[rel="manifest"]').href);
    navigator.serviceWorker.register(swUrl).catch(() => {
      // offline install just won't be available this session
    });
  });
}
