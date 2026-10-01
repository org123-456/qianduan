// 此间归处 - 陪伴对象初始化

import { setCompanion } from '../data.js';
import { Companion } from '../characters/companion.js';

export function initializeCompanion() {
  const companion = new Companion({
    id: 'default_companion',
    name: '未命名的陪伴者',
    personality: ['温和', '好奇'],
    state: 'waiting'
  });

  setCompanion(companion);
  return companion;
}
