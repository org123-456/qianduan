// 此间归处 - 系统集合

import { gameData } from './data.js';
import { runEvent } from './event_engine.js';

const dailyEvents = ['daily_chat', 'quiet_afternoon', 'share_memory'];

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

export function updateRelationshipStage() {
  const value = gameData.relationship.affection || 0;
  if (value >= 50) gameData.relationship.level = '重要陪伴';
  else if (value >= 30) gameData.relationship.level = '信任';
  else if (value >= 10) gameData.relationship.level = '熟悉';
  else gameData.relationship.level = '相遇';
}

export function getActionFeedback(action) {
  const personality = gameData.companion.personality || [];
  if (action === 'talk' && personality.includes('内向')) return '虽然有些害羞，但还是回应了你的话。';
  if (action === 'rest' && personality.includes('温柔')) return '陪伴让对方感到安心。';
  return '对方回应了你的互动。';
}

export function addSystemMemory(memory) {
  if (!gameData.memories) gameData.memories = [];
  gameData.memories.push({ type: 'daily', ...memory });
}

export function hasTriggeredEvent(id) {
  return gameData.progress.events?.includes(id) || false;
}

export function markEventTriggered(id) {
  if (!gameData.progress.events) gameData.progress.events = [];
  if (!gameData.progress.events.includes(id)) gameData.progress.events.push(id);
}
