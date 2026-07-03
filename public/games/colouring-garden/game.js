import { makeActivatable } from '../../shared/a11y.js';

(function(){
  const COLOURS = [
    { hex:'#e8849c', name:'Pink'   },
    { hex:'#e3a93f', name:'Yellow' },
    { hex:'#9b7fc7', name:'Purple' },
    { hex:'#5fa3c9', name:'Blue'   },
    { hex:'#8fb96b', name:'Green'  },
    { hex:'#d96b5c', name:'Red'    },
    { hex:'#fdf3da', name:'Cream'  },
    { hex:'#7c5e44', name:'Brown'  }
  ];
  const SHAPE_LABELS = { sky:'Sky', sun:'Sun', ground:'Ground', house:'House', roof:'Roof', door:'Door', flower1:'Flower', flower2:'Flower' };
  const paletteEl = document.getElementById('palette');
  const scene = document.getElementById('scene');
  let activeColour = COLOURS[0].hex;

  COLOURS.forEach((c,i)=>{
    const sw=document.createElement('div');
    sw.className='swatch'+(i===0?' active':'');
    sw.style.background=c.hex;
    sw.setAttribute('aria-label',c.name);
    sw.setAttribute('aria-pressed',i===0?'true':'false');
    makeActivatable(sw,()=>{
      document.querySelectorAll('.swatch').forEach(s=>{
        s.classList.remove('active');
        s.setAttribute('aria-pressed','false');
      });
      sw.classList.add('active');
      sw.setAttribute('aria-pressed','true');
      activeColour=c.hex;
    });
    paletteEl.appendChild(sw);
  });

  scene.querySelectorAll('path, circle, rect, ellipse').forEach(shape=>{
    if(!shape.id) return;
    shape.setAttribute('aria-label',SHAPE_LABELS[shape.id]||shape.id);
    makeActivatable(shape,()=>{ shape.setAttribute('fill',activeColour); });
  });

  document.getElementById('resetBtn').addEventListener('click',()=>{
    scene.querySelectorAll('path, circle, rect, ellipse').forEach(shape=>{
      if(shape.id) shape.setAttribute('fill','#ffffff');
    });
  });
})();
