// 此间归处 - 行为逻辑层

import { gameData, increaseAffection, addMemory } from './data.js';
import { triggerEvent } from './events.js';
import { getEvent } from './event_config.js';

function applyEvent(eventId) {
  const config = getEvent(eventId);
  if (!config) return;

  triggerEvent(eventId, config);

  if (config.memory) {
    addMemory(config.memory);
  }

  if (config.effects?.chapter) {
    gameData.progress.chapter = config.effects.chapter;
  }
}

const actions = {
  meet() {
    applyEvent('first_meeting');
    gameData.progress.firstMeeting = true;
  },

  talk() {
    increaseAffection(1);
    if (gameData.companion.state) {
      gameData.companion.state.mood = '愉快';
    }
    addMemory({
      title: '一次聊天',
      text: '今天进行了一次温暖的交流。'
    });
  },

  rest() {
    if (gameData.companion.state) {
      gameData.companion.state.energy = Math.min(100, gameData.companion.state.energy + 10);
      gameData.companion.state.mood = '平静';
    }
    addMemory({
      title: '一起休息',
      text: '一起度过了一段安静的时间。'
    });
  }
};

export function executeAction(action) {
  const handler = actions[action];
  if (!handler) return;
  handler();
}
