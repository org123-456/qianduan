export default {
    id: 'fishing',
    name: '钓鱼',
    icon: '🐟',
    description: '今天也来试试手气吧。',
    status: '准备中',
    render() {
        return `
            <div class="game-placeholder">
                <div class="game-placeholder-icon">🐟</div>
                <div class="game-placeholder-title">钓鱼</div>
                <div>这个游戏还在准备中。</div>
            </div>
        `;
    }
};
