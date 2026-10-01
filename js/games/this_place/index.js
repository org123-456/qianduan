// 此间归处 Game Core
// 游戏入口模块

import { renderGameUI } from './ui.js';
import { initGameState, getGameState } from './systems/game_state.js';

const ThisPlaceGame = {
  id: 'this-place',
  name: '此间归处',
  icon: '🏡',
  description: '一个关于陪伴、成长与记忆的养成游戏。',
  status: '开发中',
  version: '0.2.0',

  init(container) {
    this.container = container;
    initGameState();
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
