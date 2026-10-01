// 此间归处 - 数据层

import { saveGame, loadGame } from './save.js';

export const gameData = {
  player: {
    name: '玩家',
    createdAt: Date.now()
  },

  companion: {
    id: null,
    name: null,
    unlocked: false,
    personality: [],
    likes: [],
    dislikes: [],
    growthStage: '初识',
    state: {
      mood: '平静',
      energy: 100,
      spirit: 100
    }
  },

  relationship: {
    affection: 0,
    level: '陌生',
    trust: 0,
    familiarity: 0
  },

  memories: [],

  eventHistory: [],

  miniGameProgress: {},

  progress: {
    chapter: 0,
    firstMeeting: false
  }
};

export function setCompanion(character) {
  gameData.companion = {
    ...gameData.companion,
    ...character,
    unlocked: true
  };
  saveGame(gameData);
}

export function addMemory(memory) {
  gameData.memories.push({
    id: Date.now(),
    ...memory
  });
  saveGame(gameData);
}

export function increaseAffection(value = 1) {
  gameData.relationship.affection += value;
  saveGame(gameData);
}

export function restoreGame() {
  const saved = loadGame();
  if (!saved) return;

  Object.assign(gameData, saved);
}
