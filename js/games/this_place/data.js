// 此间归处 - 数据层

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
    state: {
      mood: '平静',
      energy: 100
    }
  },

  relationship: {
    affection: 0,
    level: '初次相遇',
    trust: 0
  },

  memories: [],

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
}

export function addMemory(memory) {
  gameData.memories.push({
    id: Date.now(),
    ...memory
  });
}

export function increaseAffection(value = 1) {
  gameData.relationship.affection += value;
}
