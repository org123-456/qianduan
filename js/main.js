import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js';
import { WechatApp } from './apps/wechat.js';

window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
window.Apps = {
    wechat: WechatApp
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 核心引擎已挂载，路径加载成功！');
    setTimeout(() => {
        if(window.PhoneAPI) window.PhoneAPI.loadSettings();
        if(window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
        console.log('✅ 聊天记录和设置已成功加载！');
    }, 300);
});

// 监听回车键发送消息
document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    if (e.key === 'Enter' && document.activeElement === chatInput) {
        e.preventDefault();
        // 🌟 核心修改：回车键现在只会把你的话发到屏幕上，绝对不会触发 AI！
        if(window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if(window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
});
