// 此间归处 - 系统集合

import { gameData } from './data.js';
import { runEvent } from './event_engine.js';

const dailyEvents = [
  'daily_chat',
  'quiet_afternoon',
  'share_memory'
];

export function getAvailableDailyEvents() {
  return dailyEvents.filter((id) => !gameData.eventHistory?.includes(id));
}

export function triggerRandomDailyEvent() {
  const available = getAvailableDailyEvents();
  if (!available.length) return null;
  const id = available[Math.floor(Math.random() * available.length)];
  runEvent(id);
  return id;
}

export function getActionFeedback(action) {
  const personality = gameData.companion.personality || [];

  if (action === 'talk' && personality.includes('内向')) {
    return '虽然有些害羞，但还是回应了你的话。';
  }

  if (action === 'rest' && personality.includes('温柔')) {
    return '陪伴让对方感到安心。';
  }

  return '对方回应了你的互动。';
}
