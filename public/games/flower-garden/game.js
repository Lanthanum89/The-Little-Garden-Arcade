import { createTapSelect } from '../../shared/tap-select.js';
import { recordCompletion } from '../../shared/storage.js';
import { makeActivatable } from '../../shared/a11y.js';

(function(){
  const COLOURS = [
    { id:'pink',   name:'Pink',   hex:'#e8849c', potClass:'pPink'   },
    { id:'yellow', name:'Yellow', hex:'#e3a93f', potClass:'pYellow' },
    { id:'purple', name:'Purple', hex:'#9b7fc7', potClass:'pPurple' },
    { id:'blue',   name:'Blue',   hex:'#5fa3c9', potClass:'pBlue'   }
  ];
  const PER_COLOUR = 2;
  const total = COLOURS.length * PER_COLOUR;

  const trayEl = document.getElementById('tray');
  const potsEl = document.getElementById('pots');
  const progressEl = document.getElementById('progress');
  const winScreen = document.getElementById('winScreen');

  const tapSelect = createTapSelect({ selectedClass: 'selected' });
  let planted=0;

  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  function flowerSVG(hex){
    return `<svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="8" r="6" fill="${hex}"/>
      <circle cx="8" cy="14" r="6" fill="${hex}"/>
      <circle cx="26" cy="14" r="6" fill="${hex}"/>
      <circle cx="11" cy="23" r="6" fill="${hex}"/>
      <circle cx="23" cy="23" r="6" fill="${hex}"/>
      <circle cx="17" cy="16" r="5" fill="#fdf3da" stroke="rgba(0,0,0,.15)" stroke-width="1"/>
    </svg>`;
  }

  function buildFlowers(){
    let list=[];
    COLOURS.forEach(c=>{ for(let i=0;i<PER_COLOUR;i++) list.push({uid:c.id+'-'+i, colour:c.id}); });
    return shuffle(list);
  }

  function renderPots(){
    potsEl.innerHTML='';
    COLOURS.forEach(c=>{
      const p=document.createElement('div');
      p.className='pot '+c.potClass;
      p.innerHTML=`<div class="pot-fill" id="fill-${c.id}"></div><span class="pot-count" id="count-${c.id}">0/${PER_COLOUR}</span>`;
      p.setAttribute('aria-label',c.name+' pot');
      makeActivatable(p,()=>handlePotTap(c.id,p));
      potsEl.appendChild(p);
    });
  }

  function renderTray(flowers){
    trayEl.innerHTML='';
    flowers.forEach(f=>{
      const c=COLOURS.find(x=>x.id===f.colour);
      const btn=document.createElement('button');
      btn.className='flower-btn';
      btn.dataset.uid=f.uid;
      btn.dataset.colour=f.colour;
      btn.innerHTML=flowerSVG(c.hex);
      btn.setAttribute('aria-label',c.name+' flower');
      btn.addEventListener('click',()=>handleFlowerTap(f.uid,btn));
      trayEl.appendChild(btn);
    });
  }

  function handleFlowerTap(uid,el){
    tapSelect.select(uid,el);
  }

  function handlePotTap(colourId,potEl){
    tapSelect.target(colourId,potEl,{
      isMatch:(selectedUid)=>{
        const flowerEl = trayEl.querySelector(`[data-uid="${selectedUid}"]`);
        return flowerEl ? flowerEl.dataset.colour===colourId : false;
      },
      onSuccess:(selectedUid)=>{
        const flowerEl = trayEl.querySelector(`[data-uid="${selectedUid}"]`);
        const c=COLOURS.find(x=>x.id===colourId);
        const fill=document.getElementById('fill-'+colourId);
        const mini=document.createElement('span');
        mini.className='mini';
        mini.innerHTML=flowerSVG(c.hex).replace('width="34" height="34"','width="16" height="16"');
        fill.appendChild(mini);

        flowerEl.classList.add('gone');
        setTimeout(()=>flowerEl.remove(),300);

        planted++;
        document.getElementById('count-'+colourId).textContent=`${fill.children.length}/${PER_COLOUR}`;
        progressEl.textContent=`${planted} of ${total} planted`;

        if(planted===total){
          recordCompletion('flower-garden');
          setTimeout(()=>winScreen.classList.add('show'),450);
        }
      },
      onFail:()=>{
        potEl.classList.add('wrong');
        setTimeout(()=>potEl.classList.remove('wrong'),400);
      }
    });
  }

  function start(){
    planted=0;
    tapSelect.reset();
    progressEl.textContent=`0 of ${total} planted`;
    winScreen.classList.remove('show');
    renderPots();
    renderTray(buildFlowers());
  }

  document.getElementById('resetBtn').addEventListener('click',start);
  document.getElementById('playAgainBtn').addEventListener('click',start);
  start();
})();
