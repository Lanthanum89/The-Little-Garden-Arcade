import { recordCompletion } from '../../shared/storage.js';
import { shuffle } from '../../shared/random.js';

(function(){
  const ROUNDS = 8;
  const MIN_COUNT = 3;
  const MAX_COUNT = 9;
  const ICONS = ['🐞', '🦋', '🐝', '🐛', '🐌'];

  const sceneEl = document.getElementById('scene');
  const answersEl = document.getElementById('answers');
  const progressEl = document.getElementById('progress');
  const winScreen = document.getElementById('winScreen');

  let round = 0;
  let correctAnswers = 0;
  let currentCorrect = 0;
  let nextRoundTimeout = null;
  let winTimeout = null;

  function randomInt(min, max){
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function renderScene(icon, count){
    sceneEl.innerHTML = '';
    for (let i = 0; i < count; i++){
      const span = document.createElement('span');
      span.className = 'critter';
      span.textContent = icon;
      span.style.setProperty('--tilt', randomInt(-12, 12) + 'deg');
      sceneEl.appendChild(span);
    }
  }

  function buildChoices(correct){
    const choices = new Set([correct]);
    while (choices.size < 4){
      const candidate = correct + randomInt(-3, 3);
      if (candidate > 0 && candidate !== correct) choices.add(candidate);
    }
    return shuffle([...choices]);
  }

  function renderAnswers(correct){
    answersEl.innerHTML = '';
    buildChoices(correct).forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = n;
      btn.setAttribute('aria-label', `${n}`);
      btn.addEventListener('click', () => handleAnswer(n, correct, btn));
      answersEl.appendChild(btn);
    });
  }

  function handleAnswer(chosen, correct, btn){
    if (chosen !== correct){
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 400);
      return;
    }

    correctAnswers++;
    round++;
    progressEl.textContent = `${correctAnswers} of ${ROUNDS} rounds`;

    if (round >= ROUNDS){
      recordCompletion('counting-garden');
      winTimeout = setTimeout(() => winScreen.classList.add('show'), 450);
    } else {
      nextRoundTimeout = setTimeout(playRound, 500);
    }
  }

  function playRound(){
    const icon = ICONS[randomInt(0, ICONS.length - 1)];
    currentCorrect = randomInt(MIN_COUNT, MAX_COUNT);
    renderScene(icon, currentCorrect);
    renderAnswers(currentCorrect);
  }

  function start(){
    round = 0;
    correctAnswers = 0;
    clearTimeout(nextRoundTimeout);
    clearTimeout(winTimeout);
    progressEl.textContent = `0 of ${ROUNDS} rounds`;
    winScreen.classList.remove('show');
    playRound();
  }

  document.getElementById('resetBtn').addEventListener('click', start);
  document.getElementById('playAgainBtn').addEventListener('click', start);
  start();
})();
