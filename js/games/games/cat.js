export default {
    id: 'cat',
    name: '养猫',
    icon: '🐱',
    description: '照顾一只属于你的猫咪。',
    status: '准备中',
    render() {
        return `
            <div class="game-placeholder">
                <div class="game-placeholder-icon">🐱</div>
                <div class="game-placeholder-title">养猫</div>
                <div>这个游戏还在准备中。</div>
            </div>
        `;
    }
};
