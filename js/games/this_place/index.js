// 此间归处 Game Core
// 游戏入口模块

import { renderGameUI } from './ui.js';
import { initGameState, getGameState } from './systems/game_state.js';
import { onEvent } from './events.js';
import { gameData, addMemory, increaseAffection, setCompanion } from './data.js';

function initFirstMeeting() {
  onEvent('first_meeting', () => {
    if (gameData.progress.firstMeeting) return;

    gameData.progress.firstMeeting = true;
    gameData.progress.chapter = 1;

    setCompanion({
      id: 'first-companion',
      name: '未知的陪伴者',
      personality: []
    });

    addMemory({
      title: '第一次相遇',
      text: '新的故事开始了。'
    });

    increaseAffection(1);
  });
}

const ThisPlaceGame = {
  id: 'this-place',
  name: '此间归处',
  icon: '🏡',
  description: '一个关于陪伴、成长与记忆的养成游戏。',
  status: '开发中',
  version: '0.3.1',

  init(container) {
    this.container = container;
    initGameState();
    initFirstMeeting();
  },

  mount(container) {
    renderGameUI(container, getGameState());
  },

  destroy() {
    this.container = null;
  }
};

export { ThisPlaceGame };
export default ThisPlaceGame;
