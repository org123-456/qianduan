// 此间归处 - 保存系统

const SAVE_KEY = 'this_place_save';

export function createSaveData(data) {
  return JSON.parse(JSON.stringify({
    version: '0.3.1',
    timestamp: Date.now(),
    data
  }));
}

export function saveGame(data) {
  const saveData = createSaveData(data);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  return saveData;
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
