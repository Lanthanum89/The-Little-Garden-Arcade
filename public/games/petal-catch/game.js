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
      petal.remove();
      if (i === lane) {
        caught++;
        scoreEl.textContent = `Caught: ${caught}`;
      } else {
        loseLife();
      }
    });
    playArea.appendChild(petal);
  }

  function loseLife(){
    if (!running) return;
    lives--;
    renderLives();
    if (lives <= 0) endGame();
  }

  function endGame(){
    running = false;
    clearInterval(spawnTimer);
    playArea.querySelectorAll('.petal').forEach(p => p.remove());
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
    playArea.querySelectorAll('.petal').forEach(p => p.remove());
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnPetal, SPAWN_MS);
  }

  document.getElementById('resetBtn').addEventListener('click', start);
  document.getElementById('playAgainBtn').addEventListener('click', start);
  start();
})();
