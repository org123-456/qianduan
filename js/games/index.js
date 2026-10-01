import { registerGame } from './game_engine.js';
import { GameUI } from './game_ui.js';

const gameLoaders = [
    ['fishing', () => import('./games/fishing.js')],
    ['daily-lottery', () => import('./games/daily_lottery.js')],
    ['cat', () => import('./games/cat.js')]
];

export const gamesReady = Promise.allSettled(gameLoaders.map(async ([id, loader]) => {
    try {
        const mod = await loader();
        registerGame(mod.default || mod);
    } catch (error) {
        console.error('Game module ' + id + ' failed to load:', error);
    }
})).then(() => true);

if (typeof window !== 'undefined') window.GameGamesReady = gamesReady;

export { GameUI };
