// 此间归处 - 陪伴对象

import { CharacterBase } from './character_base.js';

export class Companion extends CharacterBase {
  constructor(data = {}) {
    super(data);
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
