import { createTapSelect } from '../../shared/tap-select.js';
import { recordCompletion } from '../../shared/storage.js';
import { makeActivatable } from '../../shared/a11y.js';
import { shuffle } from '../../shared/random.js';

(function(){
  const TYPES = [
    { id:'rose',      name:'Rose',      hex:'#d1567a' },
    { id:'sunflower', name:'Sunflower', hex:'#e8a23a' },
    { id:'sky',       name:'Sky',       hex:'#4f8fc0' },
    { id:'lilac',     name:'Lilac',     hex:'#8f6bb0' }
  ];
  const PER_TYPE = 4;
  const total = TYPES.length * PER_TYPE;
  // Unlocked one at a time as the garden fills, echoing the concept art's
  // benches/birds/butterflies -- reward for progress, not a mechanic.
  const DECORATIONS = ['🪑', '🦋', '🐦', '⛲'];
  const MILESTONE = Math.ceil(total / DECORATIONS.length);

  const plotsEl = document.getElementById('plots');
  const trayEl = document.getElementById('tray');
  const progressEl = document.getElementById('progress');
  const decorEl = document.getElementById('decorations');
  const winScreen = document.getElementById('winScreen');

  const tapSelect = createTapSelect({ selectedClass: 'selected' });
  let planted = 0;
  let unlocked = 0;

  function flowerSVG(hex, size){
    return `<svg width="${size}" height="${size}" viewBox="0 0 34 34">
      <circle cx="17" cy="8" r="6" fill="${hex}"/>
      <circle cx="8" cy="14" r="6" fill="${hex}"/>
      <circle cx="26" cy="14" r="6" fill="${hex}"/>
      <circle cx="11" cy="23" r="6" fill="${hex}"/>
      <circle cx="23" cy="23" r="6" fill="${hex}"/>
      <circle cx="17" cy="16" r="5" fill="#fdf6ec" stroke="rgba(0,0,0,.15)" stroke-width="1"/>
    </svg>`;
  }

  function buildPlots(){
    const list = [];
    TYPES.forEach(t => { for (let i = 0; i < PER_TYPE; i++) list.push({ uid: t.id + '-' + i, type: t.id }); });
    return shuffle(list);
  }

  function renderPlots(plotList){
    plotsEl.innerHTML = '';
    plotList.forEach(p => {
      const t = TYPES.find(x => x.id === p.type);
      const el = document.createElement('div');
      el.className = 'plot';
      el.dataset.uid = p.uid;
      el.innerHTML = `<span class="ghost">${flowerSVG(t.hex, 26)}</span>`;
      el.setAttribute('aria-label', `Empty plot for a ${t.name} flower`);
      makeActivatable(el, () => handlePlotTap(p.uid, p.type, el));
      plotsEl.appendChild(el);
    });
  }

  function renderTray(plotList){
    trayEl.innerHTML = '';
    const flowers = shuffle(plotList.map(p => ({ uid: 'f-' + p.uid, type: p.type })));
    flowers.forEach(f => {
      const t = TYPES.find(x => x.id === f.type);
      const btn = document.createElement('button');
      btn.className = 'flower-btn';
      btn.dataset.uid = f.uid;
      btn.dataset.type = f.type;
      btn.innerHTML = flowerSVG(t.hex, 34);
      btn.setAttribute('aria-label', t.name + ' flower');
      btn.addEventListener('click', () => handleFlowerTap(f.uid, btn));
      trayEl.appendChild(btn);
    });
  }

  function renderDecorations(){
    decorEl.innerHTML = '';
    DECORATIONS.forEach((emoji, i) => {
      const span = document.createElement('span');
      span.className = 'decor' + (i < unlocked ? ' shown' : '');
      span.textContent = emoji;
      decorEl.appendChild(span);
    });
  }

  function handleFlowerTap(uid, el){
    tapSelect.select(uid, el);
  }

  function handlePlotTap(plotUid, plotType, plotEl){
    if (plotEl.classList.contains('filled')) return;
    tapSelect.target(plotUid, plotEl, {
      isMatch: (selectedUid) => {
        const flowerEl = trayEl.querySelector(`[data-uid="${selectedUid}"]`);
        return flowerEl ? flowerEl.dataset.type === plotType : false;
      },
      onSuccess: (selectedUid) => {
        const flowerEl = trayEl.querySelector(`[data-uid="${selectedUid}"]`);
        const t = TYPES.find(x => x.id === plotType);
        plotEl.classList.add('filled');
        plotEl.setAttribute('aria-label', `${t.name} flower, planted`);
        plotEl.setAttribute('tabindex', '-1');
        plotEl.removeAttribute('role');

        flowerEl.classList.add('gone');
        setTimeout(() => flowerEl.remove(), 300);

        planted++;
        progressEl.textContent = `${planted} of ${total} planted`;

        const shouldUnlock = Math.min(Math.floor(planted / MILESTONE), DECORATIONS.length);
        if (shouldUnlock > unlocked){
          unlocked = shouldUnlock;
          renderDecorations();
        }

        if (planted === total){
          recordCompletion('bloom-garden');
          setTimeout(() => winScreen.classList.add('show'), 450);
        }
      },
      onFail: () => {
        plotEl.classList.add('wrong');
        setTimeout(() => plotEl.classList.remove('wrong'), 400);
      }
    });
  }

  function start(){
    planted = 0;
    unlocked = 0;
    tapSelect.reset();
    progressEl.textContent = `0 of ${total} planted`;
    winScreen.classList.remove('show');
    const plotList = buildPlots();
    renderPlots(plotList);
    renderTray(plotList);
    renderDecorations();
  }

  document.getElementById('resetBtn').addEventListener('click', start);
  document.getElementById('playAgainBtn').addEventListener('click', start);
  start();
})();
