// 此间归处 Game Core
// 游戏入口模块

import { renderGameUI } from './ui.js';

const ThisPlaceGame = {
  id: 'this-place',
  name: '此间归处',
  icon: '🏡',
  description: '一个关于陪伴、成长与记忆的养成游戏。',
  status: '开发中',
  version: '0.1.0',

  init(container) {
    console.log('此间归处初始化');
    this.container = container;
  },

  mount(container) {
    renderGameUI(container);
  },

  destroy() {
    this.container = null;
  }
};

export { ThisPlaceGame };
export default ThisPlaceGame;
