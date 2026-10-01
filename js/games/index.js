import { registerGame } from './game_engine.js';
import { GameUI } from './game_ui.js';
import fishing from './games/fishing.js';
import dailyLottery from './games/daily_lottery.js';
import cat from './games/cat.js';

[fishing, dailyLottery, cat].forEach(registerGame);

export { GameUI };
