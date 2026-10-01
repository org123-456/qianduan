// 此间归处 - 羁绊系统

import { gameData } from '../data.js';

export function addAffection(value = 1) {
  gameData.relationship.affection += value;
}

export function getAffectionLevel() {
  const value = gameData.relationship.affection;
  if (value >= 100) return '深刻羁绊';
  if (value >= 50) return '熟悉相伴';
  if (value >= 10) return '逐渐了解';
  return '初次相遇';
}
