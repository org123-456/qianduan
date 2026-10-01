// 此间归处 - UI层 (已移除对缺失文件的引用，补全了基础动作)

import { gameData, saveGame } from './data.js';
import { 
  addAffection, 
  changeMood, 
  changeEnergy, 
  createMemory, 
  triggerEvent 
} from './system.js';

// 处理玩家点击互动的逻辑
function handleAction(actionType) {
  if (actionType === 'meet') {
    // 触发相遇
    triggerEvent('first_meeting');
  } else if (actionType === 'talk') {
    // 聊聊天：加好感、消耗少许体力、提升心情
    addAffection(2);
    changeMood('开心');
    changeEnergy(-5);
    createMemory('daily', '闲聊时光', '你们坐在窗边，轻声聊了聊今天的心情。');
  } else if (actionType === 'rest') {
    // 一起休息：恢复体力
    changeEnergy(20);
    changeMood('安宁');
    createMemory('daily', '安歇', '什么都不用想，享受当下一刻的静谧。');
  }
  
  // 每次操作后自动保存
  saveGame(gameData);
}

export function renderGameUI(container) {
  if (!container) return;

  const companion = gameData.companion || {};
  const latestMemory = gameData.memories?.at(-1);

  container.innerHTML = `
    <div class="this-place-game" style="padding: 16px; font-family: sans-serif; color: #333;">
      <div class="this-place-title" style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">🏡 此间归处</div>
      <div class="this-place-subtitle" style="font-size: 12px; color: #888; margin-bottom: 16px;">一个关于陪伴、成长与记忆的地方。</div>

      <div class="this-place-panel" style="background: #f7f8fa; padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
        <div><strong>陪伴对象：</strong>${companion.name || '尚未遇见'}</div>
        <div><strong>关系状态：</strong>${gameData.relationship.level || '陌生'}</div>
        <div><strong>羁绊值：</strong>${gameData.relationship.affection || 0}</div>
        <div><strong>信任度：</strong>${gameData.relationship.trust || 0}</div>
        <div><strong>心情：</strong>${companion.state?.mood || '平静'}</div>
        <div><strong>体力：</strong>${companion.state?.energy ?? 100}</div>
        <div><strong>记忆数：</strong>${gameData.memories?.length || 0} 条</div>
        <div><strong>当前章节：</strong>第 ${gameData.progress?.chapter || 0} 章</div>
      </div>

      <div class="this-place-memory" style="background: #fff8e6; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; border: 1px solid #ffe58f;">
        <strong>📖 最近记忆：</strong>
        <div style="margin-top: 4px; color: #555;">${latestMemory ? latestMemory.text : '还没有发生什么。'}</div>
      </div>

      <div class="this-place-actions" style="display: flex; gap: 8px;">
        ${!gameData.progress?.firstMeeting ? `
          <button data-action="meet" type="button" style="flex: 1; padding: 10px; background: #1890ff; color: white; border: none; border-radius: 6px; cursor: pointer;">开始相遇</button>
        ` : `
          <button data-action="talk" type="button" style="flex: 1; padding: 10px; background: #52c41a; color: white; border: none; border-radius: 6px; cursor: pointer;">聊聊天</button>
          <button data-action="rest" type="button" style="flex: 1; padding: 10px; background: #faad14; color: white; border: none; border-radius: 6px; cursor: pointer;">一起休息</button>
        `}
      </div>
    </div>
  `;

  // 绑定按钮点击事件
  container.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      handleAction(button.dataset.action);
      // 点击后重新刷新界面
      renderGameUI(container);
    });
  });
}
