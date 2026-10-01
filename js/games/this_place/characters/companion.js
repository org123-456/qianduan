// 此间归处 - 陪伴对象

import { createCharacter } from './character_base.js';

export class Companion {
  constructor(data = {}) {
    Object.assign(this, createCharacter(data));
    this.role = 'companion';
    this.relationship = {
      affection: 0,
      trust: 0
    };
  }

  interact(type = 'talk') {
    return {
      type,
      mood: this.state.mood,
      responseReady: true
    };
  }
}
