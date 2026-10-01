// 此间归处 - 核心系统

import { gameData, addMemory } from './data.js';

const listeners = new Map();

const stages = [
  { name: '陌生', min: 0 },
  { name: '相遇', min: 10 },
  { name: '熟悉', min: 30 },
  { name: '信任', min: 60 },
  { name: '重要陪伴', min: 100 }
];

export function onEvent(eventName, callback) {
  if (!listeners.has(eventName)) listeners.set(eventName, []);
  listeners.get(eventName).push(callback);
}

export function triggerEvent(eventName, payload = {}) {
  const event = {
    eventName,
    payload,
    time: Date.now()
  };

  const callbacks = listeners.get(eventName) || [];
  callbacks.forEach(callback => callback(event));
  markEventTriggered(eventName);

  return event;
}

export function updateRelationshipStage() {
  const value = gameData.relationship.affection || 0;
  const stage = [...stages].reverse().find(item => value >= item.min);
  if (stage) gameData.relationship.level = stage.name;
  return gameData.relationship.level;
}

export function createMemory(type, title, text, extra = {}) {
  addMemory({ type, title, text, ...extra });
}

export function getMemoriesByType(type) {
  return (gameData.memories || []).filter(memory => memory.type === type);
}

export function getLatestMemory() {
  return gameData.memories?.at(-1) || null;
}

const dailyEvents = ['daily_chat', 'quiet_afternoon', 'share_memory'];

export function getAvailableDailyEvents() {
  return dailyEvents.filter(id => !hasTriggeredEvent(id));
}

export function triggerRandomDailyEvent() {
  const available = getAvailableDailyEvents();
  if (!available.length) return null;
  const id = available[Math.floor(Math.random() * available.length)];
  triggerEvent(id);
  return id;
}

export function getActionFeedback(action) {
  const personality = gameData.companion.personality || [];
  if (action === 'talk' && personality.includes('内向')) return '虽然有些害羞，但还是回应了你的话。';
  if (action === 'rest' && personality.includes('温柔')) return '陪伴让对方感到安心。';
  return '对方回应了你的互动。';
}

export function hasTriggeredEvent(id) {
  return gameData.progress.events?.includes(id) || false;
}

export function markEventTriggered(id) {
  if (!gameData.progress.events) gameData.progress.events = [];
  if (!gameData.progress.events.includes(id)) gameData.progress.events.push(id);
}

export function clearEvents(eventName) {
  if (eventName) listeners.delete(eventName);
  else listeners.clear();
}
