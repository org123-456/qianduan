// 此间归处 - 关系与事件联动桥接

import { gameData } from '../data.js';
import { updateCharacterState } from './character_state.js';

export function applyInteractionResult(result = {}) {
  if (result.affection) {
    gameData.relationship.affection += result.affection;
  }

  if (result.trust) {
    gameData.relationship.trust += result.trust;
  }

  if (result.state) {
    updateCharacterState(result.state);
  }
}
