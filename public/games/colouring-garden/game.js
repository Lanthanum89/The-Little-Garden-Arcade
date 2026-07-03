(function(){
  const COLOURS = ['#e8849c','#e3a93f','#9b7fc7','#5fa3c9','#8fb96b','#d96b5c','#fdf3da','#7c5e44'];
  const paletteEl = document.getElementById('palette');
  const scene = document.getElementById('scene');
  let activeColour = COLOURS[0];

  COLOURS.forEach((hex,i)=>{
    const sw=document.createElement('div');
    sw.className='swatch'+(i===0?' active':'');
    sw.style.background=hex;
    sw.addEventListener('click',()=>{
      document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('active'));
      sw.classList.add('active');
      activeColour=hex;
    });
    paletteEl.appendChild(sw);
  });

  scene.querySelectorAll('path, circle, rect, ellipse').forEach(shape=>{
    if(!shape.id) return;
    shape.addEventListener('click',()=>{ shape.setAttribute('fill',activeColour); });
  });

  document.getElementById('resetBtn').addEventListener('click',()=>{
    scene.querySelectorAll('path, circle, rect, ellipse').forEach(shape=>{
      if(shape.id) shape.setAttribute('fill','#ffffff');
    });
  });
})();
