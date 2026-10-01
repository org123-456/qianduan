// 此间归处 - 核心系统（已合并 characters 与 systems 完整功能）

import { gameData, addMemory, setCompanion } from './data.js';

// ==========================================
// 1. 事件订阅与派发系统
// ==========================================
const listeners = new Map();

export function onEvent(eventName, callback) {
  if (!listeners.has(eventName)) listeners.set(eventName, []);
  listeners.get(eventName).push(callback);
}

export function triggerEvent(eventName, payload = {}) {
  const event = { eventName, payload, time: Date.now() };
  (listeners.get(eventName) || []).forEach(callback => callback(event));
  markEventTriggered(eventName);
  return event;
}

export function clearEvents(eventName) {
  if (eventName) listeners.delete(eventName);
  else listeners.clear();
}

// ==========================================
// 2. 伴侣角色定义与管理
// ==========================================
export function createCharacter(config = {}) {
  return {
    id: config.id || null,
    name: config.name || '未知角色',
    personality: config.personality || [],
    preferences: config.preferences || [],
    state: {
      mood: 'normal',
      energy: 100,
      ...config.state
    }
  };
}

export class Companion {
  constructor(data = {}) {
    Object.assign(this, createCharacter(data));
    this.role = 'companion';
    this.relationship = { affection: 0, trust: 0 };
  }

  interact(type = 'talk') {
    return { type, mood: this.state.mood, responseReady: true };
  }
}

let activeCompanion = null;

export function createCompanion(data = {}) {
  activeCompanion = new Companion(data);
  setCompanion(activeCompanion);
  return activeCompanion;
}

export function getCompanion() {
  return activeCompanion;
}

export function initializeCompanion() {
  return createCompanion({
    id: 'default_companion',
    name: '未命名的陪伴者',
    personality: ['温和', '好奇']
  });
}

// ==========================================
// 3. 伴侣状态管理系统
// ==========================================
export function updateCompanionState(changes = {}) {
  gameData.companion.state = { ...(gameData.companion.state || {}), ...changes };
}

export function changeMood(value) {
  updateCompanionState({ mood: value });
}

export function changeEnergy(amount) {
  const energy = gameData.companion.state?.energy || 100;
  updateCompanionState({ energy: Math.max(0, Math.min(100, energy + amount)) });
}

// ==========================================
// 4. 关系与羁绊系统
// ==========================================
export function addAffection(value = 1) {
  gameData.relationship.affection = (gameData.relationship.affection || 0) + value;
  updateRelationshipStage();
}

export function changeRelationship(change = {}) {
  const relation = gameData.relationship;
  relation.affection = Math.max(0, (relation.affection || 0) + (change.affection || 0));
  relation.trust = Math.max(0, (relation.trust || 0) + (change.trust || 0));
  updateRelationshipStage();
  return relation;
}

export function updateRelationshipStage() {
  const value = gameData.relationship.affection || 0;
  if (value >= 100) gameData.relationship.level = '深刻羁绊';
  else if (value >= 50) gameData.relationship.level = '熟悉相伴';
  else if (value >= 10) gameData.relationship.level = '逐渐了解';
  else gameData.relationship.level = '初次相遇';
  return gameData.relationship.level;
}

export function getAffectionLevel() {
  return updateRelationshipStage();
}

// 互动结果结算与数值联动桥接
export function applyInteractionResult(result = {}) {
  if (result.affection || result.trust) {
    changeRelationship({ affection: result.affection, trust: result.trust });
  }
  if (result.state) {
    updateCompanionState(result.state);
  }
}

// ==========================================
// 5. 记忆与剧情进度系统
// ==========================================
export function createMemory(type, title, text, extra = {}) {
  addMemory({ type, title, text, ...extra });
}

export function getLatestMemory() {
  return gameData.memories?.at(-1) || null;
}

export function hasTriggeredEvent(id) {
  return gameData.progress.events?.includes(id) || false;
}

export function markEventTriggered(id) {
  if (!gameData.progress.events) gameData.progress.events = [];
  if (!gameData.progress.events.includes(id)) gameData.progress.events.push(id);
}
