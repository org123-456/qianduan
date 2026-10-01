import { games } from './registry.js';
import { fishingGame } from './fishing.js';
import { dailyLotteryGame } from './daily_lottery.js';
import { catGame } from './cat.js';

window.GameModules = {
    fishing: fishingGame,
    dailyLottery: dailyLotteryGame,
    cat: catGame
};

export const GameApp = {
    renderGameHall() {
        const content = document.getElementById('app-window-content');
        if (!content) return;
        content.innerHTML = `
            <div class="games-hall">
                <div class="games-hall-intro">
                    <div class="games-hall-title">游戏</div>
                    <div class="games-hall-subtitle">选择一个游戏开始吧。</div>
                </div>
                <div class="games-list">
                    ${games.map(game => `
                        <button class="game-card" type="button" onclick="window.GameApp.openGame('${game.id}')">
                            <div class="game-card-icon">${game.icon}</div>
                            <div class="game-card-body">
                                <div class="game-card-name">${game.name}</div>
                                <div class="game-card-description">${game.description}</div>
                                <span class="game-card-status">${game.status}</span>
                            </div>
                            <div class="game-card-arrow">›</div>
                        </button>
                    `).join('')}
                </div>
            </div>`;
    },

    openGame(gameId) {
        const game = games.find(item => item.id === gameId);
        const content = document.getElementById('app-window-content');
        const title = document.getElementById('app-window-title');
        if (!game || !content) return;

        if (title) title.innerText = game.name;
        content.innerHTML = `
            <div class="game-detail">
                <div class="game-detail-header">
                    <div class="game-detail-icon">${game.icon}</div>
                    <div>
                        <div class="game-detail-title">${game.name}</div>
                        <div class="games-hall-subtitle">${game.description}</div>
                    </div>
                </div>
                ${game.render()}
                <button class="games-back-btn" type="button" onclick="window.GameApp.renderGameHall()">返回游戏大厅</button>
            </div>`;
    }
};
