// 此间归处 - 存档系统

const SAVE_KEY = 'this_place_save';

export function saveGame(gameData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('存档读取失败', error);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
