// 此间归处 - 角色状态系统

import { gameData } from '../data.js';

export function updateCompanionState(changes = {}) {
  gameData.companion.state = {
    ...(typeof gameData.companion.state === 'object' ? gameData.companion.state : {}),
    ...changes
  };
}

export function changeMood(value) {
  const state = gameData.companion.state;
  if (!state || typeof state !== 'object') {
    gameData.companion.state = { mood: value };
    return;
  }

  state.mood = value;
}

export function changeEnergy(amount) {
  const state = gameData.companion.state;
  if (!state || typeof state !== 'object') return;

  state.energy = Math.max(0, Math.min(100, (state.energy || 100) + amount));
}
