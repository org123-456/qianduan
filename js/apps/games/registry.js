export const games = [
    {
        id: 'fishing',
        name: '钓鱼',
        icon: '🐟',
        description: '今天也来试试手气吧。',
        status: '准备中',
        render: () => window.GameModules.fishing.render()
    },
    {
        id: 'daily-lottery',
        name: '每日抽奖',
        icon: '🎁',
        description: '每天可以抽一次。',
        status: '准备中',
        render: () => window.GameModules.dailyLottery.render()
    },
    {
        id: 'cat',
        name: '养猫',
        icon: '🐱',
        description: '照顾一只属于你的猫咪。',
        status: '准备中',
        render: () => window.GameModules.cat.render()
    }
];
