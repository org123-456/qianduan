// 此间归处 - 角色反馈系统

import { gameData } from './data.js';

export function getActionFeedback(action) {
  const personality = gameData.companion.personality || [];
  
  if (action === 'talk' && personality.includes('内向')) {
    return '虽然有些害羞，但还是回应了你的话。';
  }

  if (action === 'rest' && personality.includes('温柔')) {
    return '陪伴让对方感到安心。';
  }

  return '对方回应了你的互动。';
}
