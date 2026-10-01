// 此间归处 - 行为逻辑层

import { gameData, increaseAffection } from './data.js';
import { runEvent } from './event_engine.js';
import { updateRelationshipStage, addSystemMemory } from './system.js';

const actions = {
  meet() {
    runEvent('first_meeting');
    gameData.progress.firstMeeting = true;
  },

  talk() {
    increaseAffection(1);
    gameData.relationship.familiarity += 1;
    updateRelationshipStage();
    if (gameData.companion.state) gameData.companion.state.mood = '愉快';
    addSystemMemory({ title: '一次聊天', text: '今天进行了一次温暖的交流。' });
  },

  rest() {
    if (gameData.companion.state) {
      gameData.companion.state.energy = Math.min(100, gameData.companion.state.energy + 10);
      gameData.companion.state.mood = '平静';
    }
    addSystemMemory({ title: '一起休息', text: '一起度过了一段安静的时间。' });
  }
};

export function executeAction(action) {
  const handler = actions[action];
  if (handler) handler();
}
