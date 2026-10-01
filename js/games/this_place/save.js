// 此间归处 - 存档系统

import { migrateSave, SAVE_VERSION } from './migration.js';

const SAVE_KEY = 'this_place_save';

export function saveGame(gameData) {
  const data = {
    ...gameData,
    version: SAVE_VERSION
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return migrateSave(JSON.parse(raw));
  } catch (error) {
    console.warn('存档读取失败', error);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
