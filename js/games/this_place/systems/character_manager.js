// 此间归处 - 角色管理

import { Companion } from '../characters/companion.js';
import { setCompanion } from '../data.js';

let activeCompanion = null;

export function createCompanion(data) {
  activeCompanion = new Companion(data);
  setCompanion(data);
  return activeCompanion;
}

export function getCompanion() {
  return activeCompanion;
}
