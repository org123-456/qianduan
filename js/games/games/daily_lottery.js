export default {
    id: 'daily-lottery',
    name: '每日抽奖',
    icon: '🎁',
    description: '每天可以抽一次。',
    status: '准备中',
    render() {
        return `
            <div class="game-placeholder">
                <div class="game-placeholder-icon">🎁</div>
                <div class="game-placeholder-title">每日抽奖</div>
                <div>这个游戏还在准备中。</div>
            </div>
        `;
    }
};
