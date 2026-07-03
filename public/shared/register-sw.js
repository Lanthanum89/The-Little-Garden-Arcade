// Registers the service worker relative to wherever this script is loaded
// from, so it works whether the page is the hub or a game two folders deep.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) return;
    const swUrl = new URL('sw.js', manifestLink.href);
    navigator.serviceWorker.register(swUrl.href).catch(() => {
      // offline install just won't be available this session
    });
  });
}
