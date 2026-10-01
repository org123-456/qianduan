// 此间归处 - 关系成长系统

import { gameData } from '../data.js';

export function changeRelationship(change = {}) {
  const relation = gameData.relationship;

  relation.affection += change.affection || 0;
  relation.trust += change.trust || 0;

  relation.affection = Math.max(0, relation.affection);
  relation.trust = Math.max(0, relation.trust);

  return relation;
}

export function updateRelationshipStage() {
  const value = gameData.relationship.affection;

  if (value >= 100) gameData.relationship.level = '深刻羁绊';
  else if (value >= 50) gameData.relationship.level = '熟悉相伴';
  else if (value >= 10) gameData.relationship.level = '逐渐了解';
  else gameData.relationship.level = '初次相遇';

  return gameData.relationship.level;
}
