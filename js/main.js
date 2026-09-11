import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone_api.js';
import { PhoneUI } from './phone_ui.js';
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
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        }
    }

    setTimeout(() => {
        if(window.PhoneAPI) {
            // 🌟 核心：开机时刷新预设下拉菜单
            window.PhoneAPI.refreshPresetDropdowns(); 
            window.PhoneAPI.loadSettings();
        }
        if(window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
    }, 500);
});

document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    if (e.key === 'Enter' && document.activeElement === chatInput) {
        e.preventDefault();
        if(window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if(window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
});
