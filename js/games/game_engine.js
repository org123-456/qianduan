const gameRegistry = new Map();

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

    if (typeof game.mount === 'function') {
        return game.mount(container);
    }

    if (typeof game.render === 'function') {
        container.innerHTML = game.render();
    }

    return game;
}

export function unmountGame(id, container) {
    const game = getGame(id);
    if (typeof game?.unmount === 'function') {
        game.unmount(container);
    }
}

export const GameEngine = {
    registerGame,
    getGames,
    getGame,
    mountGame,
    unmountGame
};

export default GameEngine;
