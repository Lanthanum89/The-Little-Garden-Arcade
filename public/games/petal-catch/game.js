import { recordCompletion } from '../../shared/storage.js';
import { makeActivatable } from '../../shared/a11y.js';

(function(){
  const LANES = 4;
  const START_LIVES = 3;
  const SPAWN_MS = 1300;
  const FALL_MS = 3400;
  const PETALS = ['🌸','🌷','🌼'];

  const playArea = document.getElementById('playArea');
  const lanesEl = document.getElementById('lanes');
  const basketEl = document.getElementById('basket');
  const livesEl = document.getElementById('lives');
  const livesStatusEl = document.getElementById('livesStatus');
  const scoreEl = document.getElementById('score');
  const winScreen = document.getElementById('winScreen');
  const endTitle = document.getElementById('endTitle');
  const endMessage = document.getElementById('endMessage');

  let lane = Math.floor(LANES / 2);
  let lives = START_LIVES;
  let caught = 0;
  let spawnTimer = null;
  let running = false;

  function laneCentre(i){ return (i + 0.5) / LANES * 100; }

  function renderLives(){
    livesEl.textContent = '💛'.repeat(lives) + '🤍'.repeat(START_LIVES - lives);
    livesStatusEl.textContent = `${lives} of ${START_LIVES} lives remaining`;
  }

  function moveBasketTo(i){
    lane = i;
    basketEl.style.left = laneCentre(lane) + '%';
  }

  function renderLanes(){
    lanesEl.innerHTML = '';
    for (let i = 0; i < LANES; i++){
      const btn = document.createElement('div');
      btn.className = 'lane';
      btn.setAttribute('aria-label', `Move basket to lane ${i + 1}`);
      makeActivatable(btn, () => moveBasketTo(i));
      lanesEl.appendChild(btn);
    }
  }

  function spawnPetal(){
    if (!running) return;
    const i = Math.floor(Math.random() * LANES);
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
    petal.style.left = laneCentre(i) + '%';
    petal.style.animationDuration = FALL_MS + 'ms';
    petal.addEventListener('animationend', () => {
      if (!petal.isConnected) return;
      settlePetal(petal, i);
    });
    playArea.appendChild(petal);
  }

  // Runs once a petal's fall animation reaches the basket line. Freezes it
  // at its current on-screen position, then either shrinks it into the
  // basket (caught) or lets it keep dropping to the ground (missed) --
  // rather than always finishing the fall at the play-area's floor
  // regardless of outcome, which made the basket look decorative.
  function settlePetal(petal, spawnLane){
    const petalRect = petal.getBoundingClientRect();
    const areaRect = playArea.getBoundingClientRect();
    const frozenTop = petalRect.top - areaRect.top;
    petal.style.animation = 'none';
    petal.style.top = frozenTop + 'px';

    if (spawnLane === lane) {
      petal.classList.add('caught');
      caught++;
      scoreEl.textContent = `Caught: ${caught}`;
      petal.settleTimeout = setTimeout(() => petal.remove(), 200);
    } else {
      petal.style.transition = 'top .3s ease-in';
      // A single requestAnimationFrame isn't reliably enough frames for the
      // browser to have painted frozenTop before the next style change --
      // it can still collapse into one frame and skip the transition.
      // Nesting two rAF calls guarantees a full painted frame in between,
      // without forcing a synchronous reflow the way petal.offsetHeight would.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { petal.style.top = areaRect.height + 'px'; });
      });

      // transitionend is the real signal that the drop finished -- a fixed
      // timeout here doesn't know about the two-rAF startup delay above, so
      // it could fire (and lose a life) slightly before the petal visually
      // reaches the ground. Keep a generous timeout only as a fallback for
      // the rare case transitionend doesn't fire at all.
      let settled = false;
      const finishMiss = () => {
        if (settled) return;
        settled = true;
        petal.removeEventListener('transitionend', onTransitionEnd);
        clearTimeout(petal.settleTimeout);
        petal.remove();
        loseLife();
      };
      const onTransitionEnd = (e) => {
        if (e.propertyName === 'top') finishMiss();
      };
      petal.addEventListener('transitionend', onTransitionEnd);
      petal.settleTimeout = setTimeout(finishMiss, 600);
    }
  }

  function loseLife(){
    if (!running) return;
    lives--;
    renderLives();
    if (lives <= 0) endGame();
  }

  function clearPetals(){
    playArea.querySelectorAll('.petal').forEach(p => {
      clearTimeout(p.settleTimeout);
      p.remove();
    });
  }

  function endGame(){
    running = false;
    clearInterval(spawnTimer);
    clearPetals();
    recordCompletion('petal-catch');
    endTitle.textContent = 'Out of hearts!';
    endMessage.textContent = `You caught ${caught} petal${caught === 1 ? '' : 's'}. Have another go?`;
    setTimeout(() => winScreen.classList.add('show'), 300);
  }

  function start(){
    running = true;
    lives = START_LIVES;
    caught = 0;
    lane = Math.floor(LANES / 2);
    scoreEl.textContent = 'Caught: 0';
    renderLives();
    renderLanes();
    moveBasketTo(lane);
    winScreen.classList.remove('show');
    clearPetals();
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnPetal, SPAWN_MS);
  }

  document.getElementById('resetBtn').addEventListener('click', start);
  document.getElementById('playAgainBtn').addEventListener('click', start);
  start();
})();
