import { recordCompletion } from '../../shared/storage.js';
import { makeActivatable } from '../../shared/a11y.js';

(function(){
  const MOUNDS = 9;
  const ROUND_MS = 30000;
  const POP_INTERVAL_MS = 650;
  const POP_VISIBLE_MS = 1400;

  const moundsEl = document.getElementById('mounds');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const winScreen = document.getElementById('winScreen');
  const endMessage = document.getElementById('endMessage');

  let mounds = [];
  let watered = 0;
  let running = false;
  let popTimer = null;
  let roundTimer = null;
  let timeLeft = ROUND_MS;
  let lastTick = 0;

  function formatTime(ms){
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `0:${s.toString().padStart(2, '0')}`;
  }

  function renderMounds(){
    mounds.forEach(m => clearTimeout(m.retreatTimeout));
    moundsEl.innerHTML = '';
    mounds = [];
    for (let i = 0; i < MOUNDS; i++){
      const el = document.createElement('div');
      el.className = 'mound';
      el.setAttribute('aria-label', `Sprout mound ${i + 1}`);
      const sprout = document.createElement('span');
      sprout.className = 'sprout';
      sprout.textContent = '🌱';
      el.appendChild(sprout);
      const mound = { el, popped: false, watered: false, retreatTimeout: null };
      makeActivatable(el, () => waterMound(mound));
      moundsEl.appendChild(el);
      mounds.push(mound);
    }
  }

  function popRandomMound(){
    if (!running) return;
    const empties = mounds.filter(m => !m.popped);
    if (empties.length === 0) return;
    const m = empties[Math.floor(Math.random() * empties.length)];
    m.popped = true;
    m.el.classList.add('popped');
    m.retreatTimeout = setTimeout(() => retreat(m), POP_VISIBLE_MS);
  }

  function retreat(m){
    m.popped = false;
    m.watered = false;
    m.el.classList.remove('popped', 'watered');
    clearTimeout(m.retreatTimeout);
  }

  function waterMound(m){
    if (!running || !m.popped || m.watered) return;
    m.watered = true;
    watered++;
    scoreEl.textContent = `Watered: ${watered}`;
    m.el.classList.add('watered');
    clearTimeout(m.retreatTimeout);
    m.retreatTimeout = setTimeout(() => retreat(m), 200);
  }

  function tick(){
    const now = performance.now();
    timeLeft -= now - lastTick;
    lastTick = now;
    if (timeLeft <= 0){
      timerEl.textContent = '0:00';
      endRound();
      return;
    }
    timerEl.textContent = formatTime(timeLeft);
  }

  function endRound(){
    running = false;
    clearInterval(popTimer);
    clearInterval(roundTimer);
    mounds.forEach(retreat);
    recordCompletion('sprout-pop');
    endMessage.textContent = `You watered ${watered} sprout${watered === 1 ? '' : 's'}!`;
    setTimeout(() => winScreen.classList.add('show'), 300);
  }

  function start(){
    running = true;
    watered = 0;
    timeLeft = ROUND_MS;
    scoreEl.textContent = 'Watered: 0';
    timerEl.textContent = formatTime(timeLeft);
    winScreen.classList.remove('show');
    renderMounds();
    clearInterval(popTimer);
    clearInterval(roundTimer);
    lastTick = performance.now();
    popTimer = setInterval(popRandomMound, POP_INTERVAL_MS);
    roundTimer = setInterval(tick, 100);
  }

  document.getElementById('resetBtn').addEventListener('click', start);
  document.getElementById('playAgainBtn').addEventListener('click', start);
  start();
})();
