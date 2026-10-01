// 此间归处 - 事件池

import { gameData } from './data.js';
import { runEvent } from './event_engine.js';

const dailyEvents = [
  'daily_chat',
  'quiet_afternoon',
  'share_memory'
];

export function getAvailableDailyEvents() {
  return dailyEvents.filter((id) => {
    return !gameData.eventHistory?.includes(id);
  });
}

export function triggerRandomDailyEvent() {
  const available = getAvailableDailyEvents();
  if (!available.length) return null;

  const id = available[Math.floor(Math.random() * available.length)];
  runEvent(id);
  return id;
}
