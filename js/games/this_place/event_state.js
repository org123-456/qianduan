// 此间归处 - 事件状态

import { gameData } from './data.js';

export function hasTriggeredEvent(id) {
  return gameData.progress.events?.includes(id) || false;
}

export function markEventTriggered(id) {
  if (!gameData.progress.events) {
    gameData.progress.events = [];
  }

  if (!gameData.progress.events.includes(id)) {
    gameData.progress.events.push(id);
  }
}
