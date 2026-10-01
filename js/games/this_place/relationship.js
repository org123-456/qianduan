// 此间归处 - 关系成长系统

import { gameData } from './data.js';

const stages = [
  { name: '陌生', min: 0 },
  { name: '相遇', min: 10 },
  { name: '熟悉', min: 30 },
  { name: '信任', min: 60 },
  { name: '重要陪伴', min: 100 }
];

export function updateRelationshipStage() {
  const value = gameData.relationship.affection;
  const stage = [...stages].reverse().find(item => value >= item.min);

  if (stage) {
    gameData.relationship.level = stage.name;
  }

  return gameData.relationship.level;
}
