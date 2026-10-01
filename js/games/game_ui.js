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
    GameEngine.unmountActiveGame();
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

function contentLoading() {
    const { title, content } = getElements();
    if (!content) return;
    if (title) title.innerText = '游戏';
    content.innerHTML = '<div class="game-placeholder"><div class="game-placeholder-icon">🎮</div><div class="game-placeholder-title">游戏加载中</div><div>正在准备游戏列表。</div></div>';
}

function openGame(gameId) {
    const { title, content } = getElements();
    const game = GameEngine.getGame(gameId);
    if (!game || !content) return;

    if (title) title.innerText = game.name;
    try {
        GameEngine.mountGame(gameId, content);
        const back = document.createElement('button');
        back.className = 'games-back-btn';
        back.type = 'button';
        back.textContent = '‹ 返回游戏大厅';
        back.addEventListener('click', renderHall);
        content.insertBefore(back, content.firstChild);
    } catch (error) {
        console.error('Game ' + gameId + ' error:', error);
        content.innerHTML = '';
        const box = document.createElement('div');
        box.className = 'game-placeholder';
        box.innerHTML = '<div class="game-placeholder-icon">⚠️</div><div class="game-placeholder-title">这个游戏暂时无法打开</div><div>请稍后再试，其他游戏仍可继续使用。</div>';
        const back = document.createElement('button');
        back.className = 'games-back-btn';
        back.type = 'button';
        back.textContent = '返回游戏大厅';
        back.addEventListener('click', renderHall);
        box.appendChild(back);
        content.appendChild(box);
    }
}

export const GameUI = {
    open() {
        const { window } = getElements();
        if (!window) return;
        window.classList.add('open');
        const ready = globalThis.GameGamesReady;
        if (ready && typeof ready.then === 'function') {
            contentLoading();
            ready.then(() => renderHall()).catch(error => {
                console.error('Game registry error:', error);
                renderHall();
            });
        } else renderHall();
    },

    renderHall,

    openGame,

    close() {
        GameEngine.unmountActiveGame();
        const { window } = getElements();
        if (window) window.classList.remove('open');
    }
};

window.GameUI = GameUI;
