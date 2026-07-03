// Makes a non-interactive element (a <div> used as a tap target) behave
// like a button for keyboard and switch-access users.
export function makeActivatable(el, onActivate) {
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.addEventListener('click', onActivate);
  el.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onActivate();
  });
}
