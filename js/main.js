import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js';
import { WechatApp } from './apps/wechat.js';

// 🌟 核心修复：强制将所有模块挂载到全局，防止 HTML 里的点击事件找不到对象而崩溃！
window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
window.Apps = {
    wechat: WechatApp
};

// 页面加载完成后的初始化动作
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 核心引擎已挂载');
    
    // 延迟 0.3 秒读取缓存，确保不白屏
    setTimeout(() => {
        if(window.PhoneAPI) window.PhoneAPI.loadSettings();
        if(window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
        console.log('✅ 聊天记录和设置已成功加载');
    }, 300);
});

// 监听回车键发送消息
document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    if (e.key === 'Enter' && document.activeElement === chatInput) {
        e.preventDefault();
        if(window.PhoneEngine) window.PhoneEngine.sendChatMessage();
        if(window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
});
