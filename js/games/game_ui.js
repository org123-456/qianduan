import { GameEngine } from './game_engine.js';

function getElements() {
    return {
        window: document.getElementById('app-window'),
        title: document.getElementById('app-window-title'),
        content: document.getElementById('app-window-content')
    };
}

function renderHall() {
    const { title, content } = getElements();
    if (!content) return;

    if (title) title.innerText = '游戏';

    const games = GameEngine.getGames();
    content.innerHTML = `
        <div class="games-hall">
            <div class="games-hall-intro">
                <div class="games-hall-title">游戏</div>
                <div class="games-hall-subtitle">选择一个游戏开始吧。</div>
            </div>
            <div class="games-list">
                ${games.map(game => `
                    <button class="game-card" type="button" data-game-id="${game.id}">
                        <div class="game-card-icon">${game.icon || '🎮'}</div>
                        <div class="game-card-body">
                            <div class="game-card-name">${game.name}</div>
                            <div class="game-card-description">${game.description || ''}</div>
                            <span class="game-card-status">${game.status || '准备中'}</span>
                        </div>
                        <div class="game-card-arrow">›</div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    content.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => openGame(card.dataset.gameId));
    });
}

function openGame(gameId) {
    const { title, content } = getElements();
    const game = GameEngine.getGame(gameId);
    if (!game || !content) return;

    if (title) title.innerText = game.name;
    GameEngine.mountGame(gameId, content);
}

export const GameUI = {
    open() {
        const { window } = getElements();
        if (!window) return;
        window.classList.add('open');
        renderHall();
    },

    renderHall,

    openGame,

    close() {
        const { window } = getElements();
        if (window) window.classList.remove('open');
    }
};

window.GameUI = GameUI;
