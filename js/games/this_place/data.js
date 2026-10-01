// 此间归处 - 数据层

export const gameData = {
  player: {
    name: '玩家',
    createdAt: Date.now()
  },
  companion: {
    name: null,
    unlocked: false
  },
  memories: [],
  affection: 0,
  progress: {
    chapter: 0,
    firstMeeting: false
  }
};

export function addMemory(memory) {
  gameData.memories.push({
    id: Date.now(),
    ...memory
  });
}

export function increaseAffection(value = 1) {
  gameData.affection += value;
}
