// 此间归处 - 记忆系统

import { gameData, addMemory } from './data.js';

export function createMemory(type, title, text, extra = {}) {
  addMemory({
    type,
    title,
    text,
    ...extra
  });
}

export function getMemoriesByType(type) {
  return gameData.memories.filter(memory => memory.type === type);
}

export function getLatestMemory() {
  return gameData.memories.at(-1) || null;
}
