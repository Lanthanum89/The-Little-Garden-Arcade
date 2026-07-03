// Fisher-Yates shuffle, in place. Shared because every game that deals
// out cards/socks/flowers needs the same shuffle, not a new one each time.
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
