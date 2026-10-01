const gameRegistry = new Map();
let activeGameId = null;
let activeContainer = null;

export function registerGame(game) {
    if (!game?.id) throw new Error('Game id is required.');
    if (gameRegistry.has(game.id)) throw new Error(`Game already registered: ${game.id}`);
    gameRegistry.set(game.id, game);
    return game;
}

export function getGames() {
    return Array.from(gameRegistry.values());
}

export function getGame(id) {
    return gameRegistry.get(id);
}

export function mountGame(id, container) {
    const game = getGame(id);
    if (!game) throw new Error(`Game not found: ${id}`);
    if (!container) throw new Error('Game container is required.');

    if (activeGameId && activeGameId !== id) unmountGame(activeGameId, activeContainer);
    if (typeof game.init === 'function') game.init(container);
    if (typeof game.mount === 'function') game.mount(container);
    else if (typeof game.render === 'function') container.innerHTML = game.render();
    activeGameId = id;
    activeContainer = container;
    return game;
}

export function unmountGame(id, container) {
    const game = getGame(id);
    if (typeof game?.destroy === 'function') game.destroy(container);
    else if (typeof game?.unmount === 'function') game.unmount(container);
    if (activeGameId === id) {
        activeGameId = null;
        activeContainer = null;
    }
}

export function getActiveGameId() {
    return activeGameId;
}

export function unmountActiveGame() {
    if (activeGameId) unmountGame(activeGameId, activeContainer);
}

export const GameEngine = {
    registerGame,
    getGames,
    getGame,
    mountGame,
    unmountGame,
    getActiveGameId,
    unmountActiveGame
};

export default GameEngine;
