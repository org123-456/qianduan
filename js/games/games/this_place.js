export default {
    id: 'this-place',
    name: '此间归处',
    description: '一个关于陪伴、记忆与归处的养成游戏。',

    init() {
        console.log('🏠 此间归处模块已初始化');
    },

    open() {
        this.init();
        return {
            title: '此间归处',
            message: '欢迎回到这里。'
        };
    }
};
