import { createTapSelect } from '../../shared/tap-select.js';
import { recordCompletion } from '../../shared/storage.js';

(function(){
  const COLOURS = [
    { id:'red',    name:'Red',    hex:'#e0685a', basketClass:'bRed'    },
    { id:'yellow', name:'Yellow', hex:'#e8c25f', basketClass:'bYellow' },
    { id:'green',  name:'Green',  hex:'#8fb96b', basketClass:'bGreen'  },
    { id:'blue',   name:'Blue',   hex:'#6fa8c9', basketClass:'bBlue'   }
  ];
  const PER_COLOUR = 2;
  const total = COLOURS.length * PER_COLOUR;

  const lineEl = document.getElementById('line');
  const basketsEl = document.getElementById('baskets');
  const progressEl = document.getElementById('progress');
  const winScreen = document.getElementById('winScreen');

  const tapSelect = createTapSelect({ selectedClass: 'selected' });
  let sorted=0;

  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  function sockSVG(hex){
    return `<svg width="34" height="34" viewBox="0 0 34 34">
      <path d="M12 2 H22 V16 C22 22 28 22 28 28 C28 31 25 33 21 33 H10 C7 33 5 31 5 28 V10 C5 6 8 2 12 2 Z" fill="${hex}" stroke="rgba(0,0,0,.15)" stroke-width="1"/>
      <rect x="12" y="2" width="10" height="6" fill="#fff" opacity=".55"/>
    </svg>`;
  }

  function buildSocks(){
    let list=[];
    COLOURS.forEach(c=>{ for(let i=0;i<PER_COLOUR;i++) list.push({uid:c.id+'-'+i, colour:c.id}); });
    return shuffle(list);
  }

  function renderBaskets(){
    basketsEl.innerHTML='';
    COLOURS.forEach(c=>{
      const b=document.createElement('div');
      b.className='basket '+c.basketClass;
      b.innerHTML=`<div class="basket-fill" id="fill-${c.id}"></div><span class="basket-count" id="count-${c.id}">0/${PER_COLOUR}</span>`;
      b.addEventListener('click',()=>handleBasketTap(c.id,b));
      basketsEl.appendChild(b);
    });
  }

  function renderLine(socks){
    lineEl.innerHTML='';
    socks.forEach(s=>{
      const c=COLOURS.find(x=>x.id===s.colour);
      const btn=document.createElement('button');
      btn.className='sock-btn';
      btn.dataset.uid=s.uid;
      btn.dataset.colour=s.colour;
      btn.innerHTML=sockSVG(c.hex);
      btn.addEventListener('click',()=>handleSockTap(s.uid,btn));
      lineEl.appendChild(btn);
    });
  }

  function handleSockTap(uid,el){
    tapSelect.select(uid,el);
  }

  function handleBasketTap(colourId,basketEl){
    tapSelect.target(colourId,basketEl,{
      isMatch:(selectedUid)=>{
        const sockEl = lineEl.querySelector(`[data-uid="${selectedUid}"]`);
        return sockEl ? sockEl.dataset.colour===colourId : false;
      },
      onSuccess:(selectedUid)=>{
        const sockEl = lineEl.querySelector(`[data-uid="${selectedUid}"]`);
        const c=COLOURS.find(x=>x.id===colourId);
        const fill=document.getElementById('fill-'+colourId);
        const mini=document.createElement('span');
        mini.className='mini';
        mini.innerHTML=sockSVG(c.hex).replace('width="34" height="34"','width="16" height="16"');
        fill.appendChild(mini);

        sockEl.classList.add('gone');
        setTimeout(()=>sockEl.remove(),300);

        sorted++;
        document.getElementById('count-'+colourId).textContent=`${fill.children.length}/${PER_COLOUR}`;
        progressEl.textContent=`${sorted} of ${total} sorted`;

        if(sorted===total){
          recordCompletion('washing-line');
          setTimeout(()=>winScreen.classList.add('show'),450);
        }
      },
      onFail:()=>{
        basketEl.classList.add('wrong');
        setTimeout(()=>basketEl.classList.remove('wrong'),400);
      }
    });
  }

  function start(){
    sorted=0;
    tapSelect.reset();
    progressEl.textContent=`0 of ${total} sorted`;
    winScreen.classList.remove('show');
    renderBaskets();
    renderLine(buildSocks());
  }

  document.getElementById('resetBtn').addEventListener('click',start);
  document.getElementById('playAgainBtn').addEventListener('click',start);
  start();
})();
