import { renderGame } from './game.js';

const ThisPlaceGame = {
  id: 'this-place',
  name: '此间归处',
  icon: '🏡',
  description: '让TA养你，有3D陪伴的小天地。',
  status: '常驻开启',
  version: '1.0.0',

  init(container) {
    this.container = container;
  },

  mount(container) {
    this.container = container;
    renderGame(container);
  },

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
};

export { ThisPlaceGame };
export default ThisPlaceGame;
