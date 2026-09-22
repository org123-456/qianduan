import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine as LazyPhoneEngine } from './phone/phone_engine_loader.js';
import { ChatEngine } from './phone/engine/chat_engine.js';
import { ReaderEngine } from './phone/engine/reader_engine.js';
import { WechatApp } from './apps/wechat.js';

const PhoneEngine = {
    ...LazyPhoneEngine,
    ...ChatEngine,
    ...ReaderEngine
};

// 兼容旧版的发送拦截逻辑（微信统一走 sendChatMessage）
const legacySendUserMsgOnly = PhoneEngine.sendUserMsgOnly;
PhoneEngine.sendUserMsgOnly = (...args) => {
    if (Config.currentAppId === 'wechat') return;
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

    setTimeout(() => {
        if (window.PhoneAPI) {
            window.PhoneAPI.refreshPresetDropdowns();
            window.PhoneAPI.refreshPromptDropdowns();
            window.PhoneAPI.loadSettings();
        }
        if (window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
        console.log('✅ 聊天记录和设置已成功加载！');
    }, 300);
});
