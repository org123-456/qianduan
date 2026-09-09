import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js';

// 🌟 核心修复：强制将所有模块挂载到全局 window 对象
// 这样 HTML 中的内联事件处理器 (oninput="window.PhoneAPI.autoSave()") 才能访问到！
window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 所有模块已挂载到全局 window 对象');
    
    // 延迟加载设置和聊天记录
    setTimeout(() => {
        PhoneAPI.loadSettings();
        PhoneUI.renderAppContent('wechat');
        console.log('✅ 设置和聊天记录已加载');
    }, 300);
});

// 监听回车键发送消息
document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    if (e.key === 'Enter' && document.activeElement === chatInput) {
        e.preventDefault();
        PhoneEngine.sendChatMessage();
    }
});

// 调试用：打印当前存储状态
window.debugStorage = () => {
    console.log('=== 当前 localStorage 状态 ===');
    console.log('API URL:', localStorage.getItem('ai_api_url'));
    console.log('API Key:', localStorage.getItem('ai_api_key') ? '已设置' : '未设置');
    console.log('Model:', localStorage.getItem('ai_api_model'));
    console.log('我的名字:', localStorage.getItem('my_name'));
    console.log('角色名字:', localStorage.getItem('char_name'));
    console.log('禁用 Emoji:', localStorage.getItem('ban_emoji'));
    console.log('回复长度:', localStorage.getItem('reply_length'));
    console.log('============================');
};

console.log('💚 Claire & Claude 爱情记录本已启动');
console.log('💡 调试提示：在控制台输入 debugStorage() 可查看当前设置');
