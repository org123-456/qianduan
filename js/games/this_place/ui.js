// 此间归处 - UI层

import { gameData } from './data.js';
import { triggerEvent } from './events.js';

export function renderGameUI(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="this-place-game">
      <div class="this-place-title">此间归处</div>
      <div class="this-place-subtitle">一个关于陪伴、成长与记忆的地方。</div>
      <div class="this-place-panel">
        <div>陪伴对象：${gameData.companion.name || '尚未遇见'}</div>
        <div>记忆：${gameData.memories.length} 条</div>
        <div>羁绊：${gameData.affection}</div>
        <div>章节：${gameData.progress.chapter}</div>
      </div>
      <button class="this-place-start" type="button">开始相遇</button>
    </div>
  `;

  const button = container.querySelector('.this-place-start');
  if (button) {
    button.addEventListener('click', () => {
      triggerEvent('first_meeting');
      renderGameUI(container);
    });
  }
}
