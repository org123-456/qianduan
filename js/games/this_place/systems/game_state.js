// 此间归处 - 游戏状态系统

const state = {
  initialized: false,
  day: 1,
  lastAction: null
};

export function initGameState() {
  state.initialized = true;
  return state;
}

export function updateGameState(patch = {}) {
  Object.assign(state, patch);
  return state;
}

export function getGameState() {
  return state;
}

export function resetGameState() {
  state.initialized = false;
  state.day = 1;
  state.lastAction = null;
}
