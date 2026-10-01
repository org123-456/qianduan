// 此间归处 - 事件执行引擎

import { gameData, addMemory } from './data.js';
import { getEvent } from './event_config.js';
import { triggerEvent } from './events.js';

function checkCondition(condition = {}) {
  if (condition.chapter && gameData.progress.chapter < condition.chapter) {
    return false;
  }

  if (condition.affection && gameData.relationship.affection < condition.affection) {
    return false;
  }

  if (condition.firstMeeting && !gameData.progress.firstMeeting) {
    return false;
  }

  return true;
}

export function runEvent(eventId) {
  const event = getEvent(eventId);
  if (!event) return false;

  if (!checkCondition(event.condition)) {
    return false;
  }

  triggerEvent(eventId, event);

  if (event.memory) {
    addMemory(event.memory);
  }

  if (event.effects?.chapter) {
    gameData.progress.chapter = event.effects.chapter;
  }

  return true;
}
