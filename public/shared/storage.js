// Thin localStorage wrapper for tracking game completions.
// Record schema: { gameId, timestamp, completed }

const STORAGE_KEY = 'garden-arcade:progress';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage unavailable (private browsing, quota, etc) - fail silently
  }
}

export function recordCompletion(gameId) {
  const records = readAll();
  records.push({ gameId, timestamp: Date.now(), completed: true });
  writeAll(records);
}

export function getCompletions(gameId) {
  return readAll().filter(record => record.gameId === gameId);
}

export function getLastCompletion(gameId) {
  const records = getCompletions(gameId);
  return records.length ? records[records.length - 1] : null;
}

export function getAllProgress() {
  return readAll();
}
