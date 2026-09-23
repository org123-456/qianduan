import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js'; 
import { WechatApp } from './apps/wechat.js';

const legacySendUserMsgOnly = PhoneEngine.sendUserMsgOnly;
PhoneEngine.sendUserMsgOnly = (...args) => {
    return legacySendUserMsgOnly?.(...args);
};

window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
window.Apps = { wechat: WechatApp };

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 核心引擎已挂载，路径加载成功！');

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        }
    }

    if (window.PhoneUI && window.PhoneUI.renderAppContent) {
        window.PhoneUI.renderAppContent('wechat');
    }

    setTimeout(() => {
        if (window.PhoneAPI) {
            if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
            if (window.PhoneAPI.refreshPromptDropdowns) window.PhoneAPI.refreshPromptDropdowns();
            if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
        }
        console.log('✅ 设置已成功加载！');
    }, 300);
});

// 监听全局回车键
document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    
    // 微信聊天：按回车把消息发到屏幕上 (不触发AI回复，Shift+Enter换行)
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === chatInput) {
        e.preventDefault(); 
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
});
