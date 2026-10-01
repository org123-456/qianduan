// 此间归处 - UI层

import { gameData, increaseAffection, addMemory } from './data.js';
import { triggerEvent } from './events.js';

function handleAction(action) {
  if (action === 'meet') {
    triggerEvent('first_meeting');
    addMemory({
      title: '第一次相遇',
      text: '今天来到了此间归处。'
    });
  }

  if (action === 'talk') {
    increaseAffection(1);
    if (gameData.companion.state) {
      gameData.companion.state.mood = '愉快';
    }
    addMemory({
      title: '一次聊天',
      text: '今天进行了一次温暖的交流。'
    });
  }

  if (action === 'rest') {
    if (gameData.companion.state) {
      gameData.companion.state.energy = Math.min(100, gameData.companion.state.energy + 10);
      gameData.companion.state.mood = '平静';
    }
    addMemory({
      title: '一起休息',
      text: '一起度过了一段安静的时间。'
    });
  }
}

export function renderGameUI(container) {
  if (!container) return;

  const companion = gameData.companion;
  const latestMemory = gameData.memories.at(-1);

  container.innerHTML = `
    <div class="this-place-game">
      <div class="this-place-title">此间归处</div>
      <div class="this-place-subtitle">一个关于陪伴、成长与记忆的地方。</div>

      <div class="this-place-panel">
        <div>陪伴对象：${companion.name || '尚未遇见'}</div>
        <div>关系状态：${gameData.relationship.level}</div>
        <div>羁绊：${gameData.relationship.affection}</div>
        <div>信任：${gameData.relationship.trust}</div>
        <div>心情：${companion.state?.mood || '平静'}</div>
        <div>体力：${companion.state?.energy ?? 100}</div>
        <div>记忆：${gameData.memories.length} 条</div>
        <div>章节：${gameData.progress.chapter}</div>
      </div>

      <div class="this-place-memory">
        <strong>最近记忆：</strong>
        <div>${latestMemory ? latestMemory.text : '还没有发生什么。'}</div>
      </div>

      <div class="this-place-actions">
        <button data-action="meet" type="button">开始相遇</button>
        <button data-action="talk" type="button">聊聊天</button>
        <button data-action="rest" type="button">一起休息</button>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      handleAction(button.dataset.action);
      renderGameUI(container);
    });
  });
}
