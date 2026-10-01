// 此间归处 - 角色系统

import { saveGame, loadGame } from './save.js';

export const characterTemplate = {
  id: null,
  name: '',
  personality: [],
  likes: [],
  dislikes: [],
  growthStage: '初识',
  state: {
    mood: '平静',
    energy: 100,
    spirit: 100
  },
  memories: []
};

export function createCharacter(data = {}) {
  return {
    ...characterTemplate,
    ...data,
    state: {
      ...characterTemplate.state,
      ...(data.state || {})
    }
  };
}

export function updateCharacterState(character, changes) {
  character.state = {
    ...character.state,
    ...changes
  };
}
