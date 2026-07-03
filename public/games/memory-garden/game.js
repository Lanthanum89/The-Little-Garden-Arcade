import { recordCompletion } from '../../shared/storage.js';

(function(){
  const ICONS = ['🌸','🌻','🌷','🦋','🐝','💐'];
  const board = document.getElementById('board');
  const progressEl = document.getElementById('progress');
  const winScreen = document.getElementById('winScreen');
  let cards=[], flipped=[], matchedCount=0, lock=false;

  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  function buildDeck(){
    let deck=[];
    ICONS.forEach((icon,i)=>{ deck.push({uid:i+'a',icon}); deck.push({uid:i+'b',icon}); });
    return shuffle(deck);
  }

  function render(){
    board.innerHTML='';
    cards.forEach(c=>{
      const el=document.createElement('div');
      el.className='card';
      el.dataset.uid=c.uid;
      el.dataset.icon=c.icon;
      el.innerHTML='<span class="back">🌿</span>';
      el.addEventListener('click',()=>flip(el,c));
      board.appendChild(el);
    });
  }

  function flip(el,c){
    if(lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.classList.add('flipped');
    el.innerHTML=c.icon;
    flipped.push({el,c});

    if(flipped.length===2){
      lock=true;
      const [a,b]=flipped;
      if(a.c.icon===b.c.icon){
        setTimeout(()=>{
          a.el.classList.add('matched');
          b.el.classList.add('matched');
          matchedCount++;
          progressEl.textContent=`${matchedCount} of ${ICONS.length} pairs`;
          flipped=[];
          lock=false;
          if(matchedCount===ICONS.length){
            recordCompletion('memory-garden');
            setTimeout(()=>winScreen.classList.add('show'),400);
          }
        },350);
      } else {
        setTimeout(()=>{
          a.el.classList.add('wrong'); b.el.classList.add('wrong');
        },150);
        setTimeout(()=>{
          a.el.classList.remove('flipped','wrong'); a.el.innerHTML='<span class="back">🌿</span>';
          b.el.classList.remove('flipped','wrong'); b.el.innerHTML='<span class="back">🌿</span>';
          flipped=[]; lock=false;
        },900);
      }
    }
  }

  function start(){
    cards=buildDeck(); flipped=[]; matchedCount=0; lock=false;
    progressEl.textContent=`0 of ${ICONS.length} pairs`;
    winScreen.classList.remove('show');
    render();
  }

  document.getElementById('resetBtn').addEventListener('click',start);
  document.getElementById('playAgainBtn').addEventListener('click',start);
  start();
})();
