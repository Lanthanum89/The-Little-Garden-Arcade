// Tap-to-select state machine: select an item, tap a target, check the
// match, animate success/fail. Shared so every sorting/matching game (no
// drag-and-drop, ever) implements the interaction the same way.
//
// First extracted from Washing Line's sock/basket logic. Flower Garden
// will be wired in once its prototype is ported - keep the API generic
// enough to cover both.

export function createTapSelect({ selectedClass = 'is-selected' } = {}) {
  let selectedId = null;
  let selectedEl = null;

  function select(id, el) {
    if (selectedEl && selectedEl !== el) selectedEl.classList.remove(selectedClass);

    if (selectedId === id) {
      el.classList.remove(selectedClass);
      selectedId = null;
      selectedEl = null;
      return;
    }

    selectedId = id;
    selectedEl = el;
    el.classList.add(selectedClass);
  }

  function target(targetId, targetEl, { isMatch, onSuccess, onFail } = {}) {
    if (selectedId === null) return;

    const currentId = selectedId;
    const currentEl = selectedEl;
    const matched = isMatch ? isMatch(currentId, currentEl, targetId, targetEl) : false;

    if (matched) {
      if (onSuccess) onSuccess(currentId, currentEl, targetId, targetEl);
    } else if (onFail) {
      onFail(currentId, currentEl, targetId, targetEl);
    }

    if (currentEl) currentEl.classList.remove(selectedClass);
    selectedId = null;
    selectedEl = null;
  }

  function reset() {
    if (selectedEl) selectedEl.classList.remove(selectedClass);
    selectedId = null;
    selectedEl = null;
  }

  function getSelectedId() {
    return selectedId;
  }

  return { select, target, reset, getSelectedId };
}
