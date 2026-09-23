import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js'; // 引入打包好的总引擎
import { WechatApp } from './apps/wechat.js';

// 兼容旧版的发送逻辑
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

    // ⚠️ 关键修复：确保一进页面立刻渲染微信聊天列表，解决白屏问题！
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
    const novelInput = document.getElementById('novel-input');
    
    // 微信聊天：按回车把消息发到屏幕上 (不触发AI回复，Shift+Enter换行)
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === chatInput) {
        e.preventDefault(); 
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
    
    // 线下故事：按回车把消息发到屏幕上
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === novelInput) {
        e.preventDefault();
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
    }
});
